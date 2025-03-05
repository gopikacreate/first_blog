import { db,storage } from "../lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Function to add a new post
export const addPost = async (postData) => {
  try {
    const docRef = await addDoc(collection(db, "posts"), postData);
    return { id: docRef.id, ...postData };
  } catch (error) {
    console.error("Error adding post: ", error);
    return null;
  }
};

// Function to edit a post
export const editPost = async (postId, updatedData) => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, updatedData);
    return { id: postId, ...updatedData };
  } catch (error) {
    console.error("Error updating post: ", error);
    return null;
  }
};

// Function to delete a post
export const deletePost = async (postId) => {
  try {
    const postRef = doc(db, "posts", postId);
    await deleteDoc(postRef);
    return true;
  } catch (error) {
    console.error("Error deleting post: ", error);
    return false;
  }
};

export const uploadImage = async (file) => {
  if (!file) return null;
  console.log("Storage object:", storage); // Debugging line
  const storageRef = ref(storage, `images/${file.name}-${Date.now()}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};