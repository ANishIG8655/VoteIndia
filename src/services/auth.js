import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const handleAuth = (email, password, isRegister, fullname = "") => {
  const auth = getAuth();
  if (isRegister) {
    return createUserWithEmailAndPassword(auth, email, password);
  } else {
    return signInWithEmailAndPassword(auth, email, password);
  }
};

export const saveUserProfile = async (uid, data) => {
  return setDoc(doc(window.db, "users", uid), data, { merge: true });
};

export const getUserProfile = async (uid) => {
  const docSnap = await getDoc(doc(window.db, "users", uid));
  return docSnap.exists() ? docSnap.data() : null;
};
