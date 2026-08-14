
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
  writeBatch,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged,
} from "firebase/auth";
// is respected by compressing images in PhotoUploader before upload.
// Upgrade path: if images outgrow the doc limit, re-introduce Cloud Storage
// for the binary and keep only the download URL in Firestore.
import { db, auth, currentUser } from "./firebase";
import { EMAIL_TEMPLATE_SEEDS } from "./emailTemplates";

const LOCAL_PREFIX = "mischtisch:";
const LOCAL_SETTING_KEYS = new Set(["language", "logo", "checks"]);
let activeTransaction = null;

const nowIso = () => new Date().toISOString();
const normalizeEmail = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const clean = (value) => {
  if (Array.isArray(value))
    return value.map(clean).filter((item) => item !== undefined);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, clean(item)]),
    );
  }
  return value;
};

function isLocalSetting(key) {
  return LOCAL_SETTING_KEYS.has(key) || key.startsWith("seen:");
}

function readLocal(key) {
  try {
    const raw = window.localStorage.getItem(LOCAL_PREFIX + key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLocal(key, value) {
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(LOCAL_PREFIX + key);
    } else {
      window.localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(value));
    }
  } catch {}
}

async function getDocTx(ref) {
  if (activeTransaction) {
    return activeTransaction.transaction.get(ref);
  }

  return getDoc(ref);
}

async function setDocTx(ref, data, options) {
  const payload = clean(data);

  if (activeTransaction) {
    activeTransaction.pending.push({
      type: "set",
      ref,
      data: payload,
      options,
    });

    return;
  }

  return setDoc(ref, payload, options);
}

async function deleteDocTx(ref) {
  if (activeTransaction) {
    activeTransaction.pending.push({
      type: "delete",
      ref,
    });

    return;
  }

  return deleteDoc(ref);
}

function dbForTransactionOr(db) {
  return activeTransaction ? activeTransaction.db : db;
}

// ---------------------------------------------------------------- Einstellungen

export async function getSetting(key) {
  if (isLocalSetting(key)) return readLocal(key);
  const snap = await getDoc(doc(db, "settings", key));
  return snap.exists() ? (snap.data().value ?? null) : null;
}

export async function setSetting(key, value) {
  if (isLocalSetting(key)) {
    writeLocal(key, value);
    return;
  }

  if (key.startsWith("tischform-new:")) {
    const user = currentUser();
    if (!user) throw new Error("auth/no-current-user");
    await setDoc(doc(db, "tableShapeSubmissions", key), {
      value: clean(value),
      createdByUid: user.uid,
      updatedAt: nowIso(),
    });
    return;
  }

  await setDoc(
    doc(db, "settings", key),
    { value: clean(value), updatedAt: nowIso() },
    { merge: true },
  );
}

export async function nextRegistrationCode() {
  const ref = doc(db, "settings", "regCounter");
  const next = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    const value = Number(snap.exists() ? snap.data().value : 0) + 1;
    transaction.set(ref, { value, updatedAt: nowIso() });
    return value;
  });
  return `REG-${new Date().getFullYear()}-${String(next).padStart(5, "0")}`;
}

// -------------------------------------------------------------------- Betriebe

export async function getVenue(venueId) {
  if (!venueId) return null;

  const snap = await getDoc(doc(db, "venues", venueId));

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  };
}

export async function getVenues() {
  const snap = await getDocs(collection(db, "venues"));

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function upsertVenue(loc) {
  if (!loc || !loc.id) {
    throw new Error("Betrieb-ID fehlt.");
  }

  const ref = doc(db, "venues", loc.id);
  const existing = await getDoc(ref);
  const cleaned = clean(loc);

  const payload = {
    ...cleaned,
    id: loc.id,
    updatedAt: nowIso(),
    createdAt: existing.exists()
      ? existing.data().createdAt || nowIso()
      : loc.createdAt || nowIso(),
  };

  if (!payload.hostUid && currentUser()) {
    payload.hostUid = currentUser()?.uid;
  }

  await setDoc(ref, payload, { merge: true });
}

export async function deleteVenue(id) {
  const ref = doc(db, "venues", id);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().custom) await deleteDoc(ref);
}

// ---------------------------------------------------------------------- Konto

export async function getAccount() {
  const user = currentUser();
  if (!user) return null;

  const profileSnap = await getDoc(doc(db, "guests", user.uid));
  const reservationsSnap = await getDocs(
    query(collection(db, "reservations"), where("guestUid", "==", user.uid)),
  );

  if (!profileSnap.exists() && reservationsSnap.empty) return null;
  const reservations = reservationsSnap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort(
      (a, b) =>
        String(a.dateKey || "").localeCompare(String(b.dateKey || "")) ||
        String(a.slot || "").localeCompare(String(b.slot || "")),
    );

  return {
    profile: profileSnap.exists() ? profileSnap.data().profile || null : null,
    res: reservations,
  };
}

export async function setAccount(account) {
  const user = currentUser();

  if (!user) return;

  const ref = doc(dbForTransactionOr(db), "guests", user.uid);

  await setDocTx(
    ref,
    {
      profile: account?.profile || null,
      guestUid: user.uid,
      updatedAt: nowIso(),
    },
    { merge: true },
  );
}

// -------------------------------------------------------------- Reservierungen

export async function listReservations(venueId) {
  const snap = await getDocs(
    query(collection(db, "reservations"), where("locId", "==", venueId)),
  );
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) =>
      String(a.createdAt || "").localeCompare(String(b.createdAt || "")),
    );
}

export async function addReservation(res) {
  let user = currentUser();



  if (!user) {
  

    const credential = await signInAnonymously(auth);

    user = credential.user;

   
  }



  const ref = doc(
    dbForTransactionOr(db),
    "reservations",
    res.id
  );

  const data = {
    ...clean(res),
    id: res.id,
    guestUid: user.uid,
    createdAt: res.createdAt || nowIso(),
  };

  await setDocTx(ref, data);

 
}

export async function removeReservation(venueId, resId) {
  const ref = doc(db, "reservations", resId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  if (snap.data().locId !== venueId)
    throw new Error("Reservierung gehört nicht zu diesem Betrieb.");
  await deleteDoc(ref);
}

// ------------------------------------------------------------------- Belegung

const occupancyId = (venueId, dateKey) =>
  `${encodeURIComponent(venueId)}__${dateKey}`;

export async function getOccupancy(venueId, dateKey) {
  const ref = doc(
    dbForTransactionOr(db),
    "occupancy",
    occupancyId(venueId, dateKey),
  );

  const snap = await getDocTx(ref);

  return snap.exists() ? snap.data().slots || {} : {};
}

export async function setOccupancy(venueId, dateKey, occ) {
  const ref = doc(
    dbForTransactionOr(db),
    "occupancy",
    occupancyId(venueId, dateKey),
  );

  await setDocTx(ref, {
    venueId,
    dateKey,
    slots: clean(occ || {}),
    updatedAt: nowIso(),
  });
}



// ---------------------------------------------------------------- Benachrichtigungen

export async function listNotifications(venueId) {
  const snap = await getDocs(
    query(collection(db, "notifications"), where("venueId", "==", venueId)),
  );
  return snap.docs
    .map((doc) => {
      const row = doc.data();
      return {
        id: doc.id,
        an: row.recipient || row.an || "",
        betreff: row.subject || row.betreff || "",
        lines: row.lines || [],
        createdAt: row.createdAt || "",
      };
    })
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
}

export async function addNotification(item) {
  const user = currentUser();
  if (!user) throw new Error("auth/no-current-user");
  await setDoc(doc(db, "notifications", item.id), {
    venueId: item.venue_id || item.venueId,
    recipient: item.recipient || item.an || "",
    subject: item.subject || item.betreff || "",
    lines: item.lines || [],
    createdAt: item.createdAt || nowIso(),
    createdByUid: user.uid,
    hostUid: item.hostUid || "",
  });
}

export async function removeNotification(venueId, id) {
  const ref = doc(db, "notifications", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  if (snap.data().venueId !== venueId)
    throw new Error("Benachrichtigung gehört nicht zu diesem Betrieb.");
  await deleteDoc(ref);
}

// ---------------------------------------------------------------------- Fotos

export async function getPhotos(venueId) {
  const snap = await getDoc(doc(db, "venuePhotos", venueId));
  return snap.exists() && Array.isArray(snap.data().items)
    ? snap.data().items
    : [];
}

export async function setPhotos(venueId, photos) {
  if (!currentUser())
    throw new Error(
      "Für Foto-Uploads ist eine Gastgeber-Anmeldung erforderlich.",
    );

  const ref = doc(db, "venuePhotos", venueId);

  const items = (photos || []).map((photo) => ({
    id:
      photo.id || `f-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    titel: photo.titel || "",
    klein: photo.klein || "",
    gross: photo.gross || "",
  }));

  await setDoc(ref, { venueId, items, updatedAt: nowIso() });
  return items;
}

// --------------------------------------------------------------------- Zugänge
export async function signInHost(email, password) {
  const normalizedEmail = normalizeEmail(email);

  const credential = await signInWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  );

  const profileRef = doc(db, "hostProfiles", credential.user.uid);

  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    await signOut(auth);
    throw new Error("HOST_PROFILE_NOT_FOUND");
  }

  const profile = profileSnap.data();

  return {
    uid: credential.user.uid,
    email: credential.user.email,
    betriebId: profile.betriebId,
    inhaber: profile.inhaber || "",
  };
}
export async function createHostAccount(email, password) {
  const normalizedEmail = normalizeEmail(email);

  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  );

  return {
    uid: credential.user.uid,
    email: credential.user.email,
  };
}

// Saves the complete host registration as one Firestore transaction.
// The password is intentionally never written to Firestore; Firebase Auth
// securely owns host credentials.
export async function saveHostRegistration({ venue, registration, profile }) {
  const user = currentUser();
  if (!user) throw new Error("auth/no-current-user");
  if (!venue?.id) throw new Error("Betrieb-ID fehlt.");

  const registrationId = registration?.id || user.uid;
  const profileRef = doc(db, "hostProfiles", user.uid);
  const venueRef = doc(db, "venues", venue.id);
  const registrationRef = doc(db, "registrations", registrationId);
  const counterRef = doc(db, "settings", "regCounter");
  const createdAt = registration?.createdAt || nowIso();

  return runTransaction(db, async (transaction) => {
    // Firestore requires all transaction reads before transaction writes.
    const counterSnap = await transaction.get(counterRef);
    const counterValue =
      Number(counterSnap.exists() ? counterSnap.data().value : 0) + 1;
    const regCode = `REG-${new Date().getFullYear()}-${String(counterValue).padStart(5, "0")}`;

    transaction.set(counterRef, {
      value: counterValue,
      updatedAt: nowIso(),
    });

    transaction.set(
      profileRef,
      clean({
        uid: user.uid,
        email: user.email,
        betriebId: venue.id,
        inhaber: profile?.inhaber || registration?.inhaber || "",
        registrationId,
        registrationStatus: "pending",
        createdAt: profile?.createdAt || createdAt,
        updatedAt: nowIso(),
      }),
    );

    transaction.set(
      venueRef,
      clean({
        ...venue,
        id: venue.id,
        hostUid: user.uid,
        email: user.email,
        regCode,
        registrationId,
        registrationStatus: "pending",
        createdAt: venue.createdAt || createdAt,
        updatedAt: nowIso(),
      }),
    );

    transaction.set(
      registrationRef,
      clean({
        ...registration,
        id: registrationId,
        betriebId: venue.id,
        hostUid: user.uid,
        createdByUid: user.uid,
        email: user.email,
        regCode,
        status: "pending",
        createdAt,
        submittedAt: createdAt,
        updatedAt: nowIso(),
      }),
    );

    return { registrationId, regCode };
  });
}

export async function deleteCurrentHostAccount() {
  const user = currentUser();
  if (!user) return;
  try {
    await deleteDoc(doc(db, "hostProfiles", user.uid));
  } catch {}
  await user.delete();
}

export async function reauthenticateHost(currentPassword) {
  const user = currentUser();
  if (!user || !user.email) throw new Error("auth/no-current-user");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  return user;
}

export async function updateHostPassword(newPassword) {
  if (!currentUser()) throw new Error("auth/no-current-user");
  await updatePassword(currentUser(), newPassword);
}

export async function changeHostPassword(currentPassword, newPassword) {
  await reauthenticateHost(currentPassword);
  await updateHostPassword(newPassword);
}

export async function getHosts() {
  const user = currentUser();
  if (!user) return {};
  const hosts = {};
  try {
    const snap = await getDocs(collection(db, "hostProfiles"));
    snap.docs.forEach((doc) => {
      const data = doc.data();
      hosts[normalizeEmail(data.email)] = { ...data, uid: doc.id };
    });
    return hosts;
  } catch {
    const own = await getDoc(doc(db, "hostProfiles", currentUser()?.uid));
    if (own.exists()) {
      const data = own.data();
      hosts[normalizeEmail(data.email)] = { ...data, uid: own.id };
    }
    return hosts;
  }
}

export async function upsertHost(host) {
  if (!currentUser()) throw new Error("auth/no-current-user");
  await setDoc(
    doc(db, "hostProfiles", currentUser()?.uid),
    {
      uid: currentUser()?.uid,
      email: currentUser().email,
      betriebId: host.betriebId,
      inhaber: host.inhaber || "",
      updatedAt: nowIso(),
    },
    { merge: true },
  );
}

// Resolves once Firebase auth state is known (current user or null). On a
// fresh page load auth.currentUser is null until the SDK restores the
// persisted session asynchronously — callers like getSession() must wait,
// otherwise a signed-in host briefly looks signed out and gets the login
// form instead of the host area.
function waitForAuth() {
  if (!auth) return Promise.resolve(null);
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user || null);
    });
  });
}

export async function getSession() {
  const user = await waitForAuth();
  if (!user || user.isAnonymous) return null;
  const snap = await getDoc(doc(db, "hostProfiles", user.uid));
  if (!snap.exists()) return null;
  return {
    uid: user.uid,
    email: user.email,
    betriebId: snap.data().betriebId,
    inhaber: snap.data().inhaber || "",
  };
}

export async function setSession(session) {
  if (!session && auth) await signOut(auth);
}

// --------------------------------------------------------------- Registrierungen

export async function listRegistrations() {
  const snap = await getDocs(collection(db, "registrations"));
  return snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) =>
      String(a.createdAt || "").localeCompare(String(b.createdAt || "")),
    );
}

export async function addRegistration(reg) {
  if (!currentUser()) throw new Error("auth/no-current-user");
  await setDoc(doc(db, "registrations", reg.id), {
    ...clean(reg),
    id: reg.id,
    createdByUid: currentUser()?.uid,
    createdAt: reg.createdAt || nowIso(),
  });
}

// ----------------------------------------------------------- E-Mail-Vorlagen

// Default email templates (will be overridden by Firestore if available)

function defaultEmailTemplate(key, lang) {
  console.log("🔎 Looking for email template:", {
    key,
    lang,
  });

  console.log(
    "📦 Available EMAIL_TEMPLATE_SEEDS:",
    EMAIL_TEMPLATE_SEEDS
  );

  const template = EMAIL_TEMPLATE_SEEDS.find(
    (item) =>
      item.key === key &&
      item.lang === lang
  );

  console.log(
    "✅ Found template:",
    template
  );

  return template
    ? {
        subject: template.subject,
        lines: template.lines,
      }
    : null;
}

export async function getEmailTemplate(key, lang) {
  const id = encodeURIComponent(`${key}__${lang}`);
  try {
    const snap = await getDoc(doc(db, "emailTemplates", id));
    if (snap.exists())
      return { subject: snap.data().subject, lines: snap.data().lines || [] };
  } catch (error) {
    console.warn(
      "Firebase-E-Mail-Vorlage nicht verfügbar; Standardvorlage wird verwendet.",
      error,
    );
  }
  return defaultEmailTemplate(key, lang);
}

export async function setEmailTemplate(key, lang, subject, lines) {
  const id = encodeURIComponent(`${key}__${lang}`);
  await setDoc(doc(db, "emailTemplates", id), {
    key,
    lang,
    subject,
    lines,
    updatedAt: nowIso(),
  });
}

// ---------------------------------------------------------- Wartung & Backup

export async function resetAll() {
  const user = currentUser();
  if (!user) return;
  const batch = writeBatch(db);
  batch.delete(doc(db, "guests", user.uid));
  const reservations = await getDocs(
    query(collection(db, "reservations"), where("guestUid", "==", user.uid)),
  );
  reservations.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(LOCAL_PREFIX))
    .forEach((key) => window.localStorage.removeItem(key));
  await Promise.allSettled([signOut(auth)]);
}

export async function downloadBackup() {
  const data = {
    exportedAt: nowIso(),
    format: "mischtisch-firebase-json-v1",
    venues: await getVenues(),
    account: await getAccount(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mischtisch-sachsen-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function restoreBackup(file) {
  const data = JSON.parse(await file.text());
  if (data.format !== "mischtisch-firebase-json-v1")
    throw new Error("Ungültiges Firebase-Backupformat.");
  for (const venue of data.venues || []) await upsertVenue(venue);
  if (data.account) {
    await setAccount(data.account);
    for (const reservation of data.account.res || [])
      await addReservation(reservation);
  }
  return true;
}

// Firestore transaction used by guest booking/cancellation paths. Writes are
// queued until all reads have completed, satisfying Firestore transaction rules.
export async function withTransaction(fn) {
  if (activeTransaction) return fn();
  return runTransaction(db, async (transaction) => {
    const previous = activeTransaction;
    activeTransaction = { transaction, db, pending: [] };
    try {
      const output = await fn();
      for (const op of activeTransaction.pending) {
        if (op.type === "set") {
          if (op.options) transaction.set(op.ref, op.data, op.options);
          else transaction.set(op.ref, op.data);
        } else {
          transaction.delete(op.ref);
        }
      }
      return output;
    } finally {
      activeTransaction = previous;
    }
  });
}
