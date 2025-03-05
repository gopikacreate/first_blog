"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { logOut } from "../../lib/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { addPost, editPost, deletePost, uploadImage } from "../../lib/firebaseCrud";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdminPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [newPost, setNewPost] = useState({
    title: "",
    tagline: "",
    content: "",
    image:null,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const postsPerPage = 5;
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.email !== "gopikagopakumar0799@gmail.com") {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "posts"));
    const fetchedPosts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPosts(fetchedPosts);
    setLoading(false);
  };
  // const handleImageUpload = async (file) => {
  //   if (!file) return null;
  //   return await uploadImage(file);
  // };
  const handleImageUpload = async (file) => {
    if (!file) return null;
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "simpleblog"); // Replace with your actual upload preset
  
    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/defzpkljn/image/upload", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      return data.secure_url; // URL of the uploaded image
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return null;
    }
  };
  
  const handleAddPost = async () => {
    if (!newPost.title || !newPost.tagline || !newPost.content || !newPost.image) {
      alert("Please fill all fields");
      return;
    }
  
    const imageUrl = await handleImageUpload(newPost.image);
    if (!imageUrl) {
      alert("Image upload failed");
      return;
    }
  
    const addedPost = await addPost({
      title: newPost.title,
      tagline: newPost.tagline,
      content: newPost.content,
      image: imageUrl, // Use Cloudinary URL
      date: new Date(),
    });
  
    if (addedPost) {
      setPosts([addedPost, ...posts]);
      setNewPost({ title: "", tagline: "", content: "", image: null });
    }
  };
  

  // const handleAddPost = async () => {
  //   if (!newPost.title || !newPost.tagline || !newPost.content || !newPost.image) {
  //     alert("Please fill all fields");
  //     return;
  //   }
  //   const imageUrl = await handleImageUpload(newPost.image);
  //   if (!imageUrl) {
  //     alert("Image upload failed");
  //     return;
  //   }
  //   const addedPost = await addPost({
  //     title: newPost.title,
  //     tagline: newPost.tagline,
  //     content: newPost.content,
  //     image: newPost.image,
  //     date: new Date(),
  //   });
  //   if (addedPost) {
  //     setPosts([addedPost, ...posts]);
  //     setNewPost({ title: "", tagline: "", content: "", image: null });
  //   }
  // };
  const openEditModal = (post) => {
    setPostToEdit(post);
    setShowEditModal(true);
  };

  const handleEditPost = async () => {
    if (postToEdit) {
      let imageUrl = postToEdit.image;
      if (typeof postToEdit.image !== "string") {
        imageUrl = await handleImageUpload(postToEdit.image);
      }
  
      const updatedPost = await editPost(postToEdit.id, {
        title: postToEdit.title,
        tagline: postToEdit.tagline,
        content: postToEdit.content,
        image: imageUrl, // Use Cloudinary URL
        date: new Date(),
      });
  
      if (updatedPost) {
        setPosts(posts.map((post) => (post.id === postToEdit.id ? updatedPost : post)));
      }
  
      setShowEditModal(false);
      setPostToEdit(null);
    }
  };
  

  // const handleEditPost = async () => {
  //   if (postToEdit) {
  //     let imageUrl = postToEdit.image;
  //     if (typeof postToEdit.image !== "string") {
  //       imageUrl = await handleImageUpload(postToEdit.image);
  //     }
  //     const updatedPost = await editPost(postToEdit.id, {
  //       title: postToEdit.title,
  //       tagline: postToEdit.tagline,
  //       content: postToEdit.content,
  //       image: imageUrl,
  //       date: new Date(),
  //     });
  //     if (updatedPost) {
  //       setPosts(posts.map((post) => (post.id === postToEdit.id ? updatedPost : post)));
  //     }
  //     setShowEditModal(false);
  //     setPostToEdit(null);
  //   }
  // };

  // const handleEditPost = async () => {
  //   if (postToEdit) {
  //     const updatedPost = await editPost(postToEdit.id, {
  //       title: postToEdit.title,
  //       tagline: postToEdit.tagline,
  //       content: postToEdit.content,
  //       image: postToEdit.image,
  //     });
  //     if (updatedPost) {
  //       setPosts(posts.map((post) => (post.id === postToEdit.id ? updatedPost : post)));
  //     }
  //     setShowEditModal(false);
  //     setPostToEdit(null);
  //   }
  // };
  const handleDeletePost = async () => {
    if (postToDelete) {
      const success = await deletePost(postToDelete);
      if (success) {
        setPosts(posts.filter((post) => post.id !== postToDelete));
      }
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  const openDeleteModal = (postId) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="admin-container">
      <h1 className="main-heading">Admin Panel</h1>
 {/* Edit Modal */}
 {showEditModal && postToEdit && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Post</h2>
            <input type="text" value={postToEdit.title} onChange={(e) => setPostToEdit({ ...postToEdit, title: e.target.value })} />
            <input type="text" value={postToEdit.tagline} onChange={(e) => setPostToEdit({ ...postToEdit, tagline: e.target.value })} />
            <textarea value={postToEdit.content} onChange={(e) => setPostToEdit({ ...postToEdit, content: e.target.value })} />
            <input type="file" onChange={(e) => setPostToEdit({ ...postToEdit, image: e.target.files[0] })} />
            <button onClick={handleEditPost}>Save Changes</button>
            <button onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}
      {/* Add New Post Form */}
      <div className="new-post-form">
        <h2 className="form-heading">Create New Post</h2>
        <input type="text" placeholder="Enter post title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
        <input type="text" placeholder="Enter tagline" value={newPost.tagline} onChange={(e) => setNewPost({ ...newPost, tagline: e.target.value })} />
        <textarea placeholder="Write your post content..." value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} />
        <input type="file" onChange={(e) => setNewPost({ ...newPost, image: e.target.files[0] })} />
        <button onClick={handleAddPost}>Add New Post</button>
      </div>

      <div className="posts-list">
        {loading ? (
          <p>Loading posts...</p>
        ) : (
          <table className="post-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Tagline</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPosts.map((post) => (
                <tr key={post.id} className="post-item">
                  <td><img src={post.image} alt="Post" className="post-image" /></td>
                  <td>{post.title}</td>
                  <td>{post.tagline}</td>
                  <td>{post.date?.seconds ? new Date(post.date.seconds * 1000).toDateString() : "Date not available"}</td>
                  <td>
                  <button className="edit-btn" onClick={() => openEditModal(post)}>Edit</button>

                    <button className="delete-btn" onClick={() => openDeleteModal(post.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
{console.log("showDeleteModal",showDeleteModal)}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this post?</p>
            <button onClick={handleDeletePost} className="confirm-btn">Yes, Delete</button>
            <button onClick={() => setShowDeleteModal(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
