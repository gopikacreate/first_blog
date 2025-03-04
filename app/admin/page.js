"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { logOut } from "../../lib/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { addPost, editPost, deletePost } from "../../lib/firebaseCrud";
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
    image: "",
  });
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

  const handleAddPost = async () => {
    if (
      !newPost.title ||
      !newPost.tagline ||
      !newPost.content ||
      !newPost.image
    ) {
      alert("Please fill all fields");
      return;
    }
    const addedPost = await addPost({
      title: newPost.title,
      tagline: newPost.tagline,
      content: newPost.content,
      image: newPost.image,
      date: new Date(),
    });
    if (addedPost) {
      setPosts([addedPost, ...posts]);
      setNewPost({ title: "", tagline: "", content: "", image: "" });
    }
  };

  const handleEditPost = async (postId) => {
    const newTitle = prompt("Enter new title:");
    if (newTitle) {
      const updatedPost = await editPost(postId, { title: newTitle });
      if (updatedPost) {
        setPosts(
          posts.map((post) => (post.id === postId ? updatedPost : post))
        );
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (confirm("Are you sure you want to delete this post?")) {
      const success = await deletePost(postId);
      if (success) {
        setPosts(posts.filter((post) => post.id !== postId));
      }
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="admin-container">
      <h1 className="main-heading">Admin Panel</h1>

      {/* Add New Post Form */}

      <div className="new-post-form">
        <h2 className="form-heading">Create New Post</h2>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            placeholder="Enter post title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Tagline</label>
          <input
            type="text"
            placeholder="Enter tagline"
            value={newPost.tagline}
            onChange={(e) =>
              setNewPost({ ...newPost, tagline: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Content</label>
          <textarea
            placeholder="Write your post content..."
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            type="text"
            placeholder="Paste image link"
            value={newPost.image}
            onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
          />
        </div>

        <button className="add-post-btn" onClick={handleAddPost}>
          Add New Post
        </button>
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
                  <td>
                    <img
                      src={post.imageurl}
                      alt="Post"
                      className="post-image"
                    />
                  </td>
                  <td>{post.title}</td>
                  <td>{post.tagline}</td>
                  <td>
                    {post.date?.seconds
                      ? new Date(post.date.seconds * 1000).toDateString()
                      : "Date not available"}
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditPost(post.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {currentPage > 1 && (
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            ⬅ Previous
          </button>
        )}
        {indexOfLastPost < posts.length && (
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next ➡
          </button>
        )}
      </div>
    </div>
  );
}
