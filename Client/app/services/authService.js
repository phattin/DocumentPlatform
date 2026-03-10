import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";

import { auth } from "../lib/firebase";

// đăng ký
export const register = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// đăng nhập
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// đăng xuất
export const logout = () => {
  return signOut(auth);
};