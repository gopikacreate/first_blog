"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "../../lib/firebase";
import { logOut } from "../../lib/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  addPost,
  editPost,
  deletePost,
  uploadImage,
} from "../../lib/firebaseCrud";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function AdminPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [newPost, setNewPost] = useState({
    title: "",
    tagline: "",
    content: "",
    image: null,
    video: null,
  });
  console.log("Post debug:", newPost);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const postsPerPage = 5;
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null); // Create a ref for the file input
  const router = useRouter();
  console.log("postToEdit", postToEdit);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // if (!user || user.email !== "gopikagopakumar0799@gmail.com") {
      //   router.push("/");
      // }

      if (
        !user ||
        ![
          "gopikagopakumar0799@gmail.com",
          "gopikagnair018@gmail.com",
          "sachinvijayd13@gmail.com",
        ].includes(user.email)
      ) {
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
  // const handleRemoveMedia = () => {
  //   setNewPost({ ...newPost, image: null });
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = ""; // Reset file input field
  //   }
  // };

  const handleRemoveMedia = () => {
    setNewPost({ ...newPost, image: null, video: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditErrors({});
  };
  const handleRemoveImageEdit = () => {
    setPostToEdit({ ...postToEdit, image: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input field
    }
  };

  const handleClearForm = () => {
    setNewPost({
      title: "",
      tagline: "",
      content: "",
      image: null,
      video: null,
    });
    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input field
    }
  };

  const handleFormHide = () => {
    handleClearForm();
    setOpen(false);
  };

  // upload image OR video to Cloudinary and return the URL
const handleMediaUpload = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "simpleblog");

  const endpoint = file.type.startsWith("video")
    ? "https://api.cloudinary.com/v1_1/defzpkljn/video/upload"
    : "https://api.cloudinary.com/v1_1/defzpkljn/image/upload";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};


  // const handleImageUpload = async (file) => {
  //   if (!file) return null;

  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("upload_preset", "simpleblog"); // Replace with your actual upload preset

  //   try {
  //     const response = await fetch(
  //       "https://api.cloudinary.com/v1_1/defzpkljn/image/upload",
  //       {
  //         method: "POST",
  //         body: formData,
  //       }
  //     );

  //     const data = await response.json();
  //     return data.secure_url; // URL of the uploaded image
  //   } catch (error) {
  //     console.error("Cloudinary upload error:", error);
  //     return null;
  //   }
  // };

  const handleAddPost = async () => {
    setIsLoading(true);
    setErrors({}); // Reset validation errors

    // ── simple field validation ──
    const validationErrors = {};
    if (!newPost.title) validationErrors.title = "Title is required";
    if (!newPost.tagline) validationErrors.tagline = "Tagline is required";
    if (!newPost.content) validationErrors.content = "Content is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    // ── upload media (image OR video) ──
    let imageUrl = null;
    let videoUrl = null;

    if (newPost.image) {
      // if user picked an image
      imageUrl = await handleImageUpload(newPost.image);
    }

    if (newPost.video) {
      // if user picked a video
      videoUrl = await handleImageUpload(newPost.video);
    }

    try {
      const addedPost = await addPost({
        title: newPost.title,
        tagline: newPost.tagline,
        content: newPost.content,
        image: imageUrl, // may be null
        video: videoUrl, // may be null
        date: Timestamp.fromDate(new Date()),
      });

      if (addedPost) {
        setPosts([addedPost, ...posts]);
        setNewPost({
          title: "",
          tagline: "",
          content: "",
          image: null,
          video: null,
        });
        setOpen(false);
      }
    } catch (error) {
      console.error("Error adding post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleAddPost = async () => {
  //   setIsLoading(true);
  //   setErrors({}); // Reset validation errors

  //   let validationErrors = {};

  //   // Validate required fields
  //   if (!newPost.title) validationErrors.title = "Title is required";
  //   if (!newPost.tagline) validationErrors.tagline = "Tagline is required";
  //   if (!newPost.content) validationErrors.content = "Content is required";

  //   // If errors exist, update state and stop function execution
  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);
  //     setIsLoading(false);
  //     return;
  //   }

  //   let imageUrl = null;
  //   if (newPost.image) {
  //     imageUrl = await handleImageUpload(newPost.image);
  //   }

  //   try {
  //     const addedPost = await addPost({
  //       title: newPost.title,
  //       tagline: newPost.tagline,
  //       content: newPost.content,
  //       image: imageUrl, // Image is optional
  //       date: Timestamp.fromDate(new Date()),
  //     });

  //     if (addedPost) {
  //       setPosts([addedPost, ...posts]);
  //       setNewPost({ title: "", tagline: "", content: "", image: null });
  //       setOpen(false);
  //     }
  //   } catch (error) {
  //     console.error("Error adding post:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const openEditModal = (post) => {
    setPostToEdit(post);
    setShowEditModal(true);
  };


  const handleEditPost = async () => {
  setIsLoading(true);
  setEditErrors({});

  const validationErrors = {};
  if (!postToEdit.title) validationErrors.title = "Title is required";
  if (!postToEdit.tagline) validationErrors.tagline = "Tagline is required";
  if (!postToEdit.content) validationErrors.content = "Content is required";

  if (Object.keys(validationErrors).length > 0) {
    setEditErrors(validationErrors);
    setIsLoading(false);
    return;
  }

  try {
    let imageUrl = postToEdit.image;
    let videoUrl = postToEdit.video;

    // Upload image if it's a new File (not a URL)
    if (postToEdit.image && typeof postToEdit.image !== "string") {
      imageUrl = await handleMediaUpload(postToEdit.image);
    }

    // Upload video if it's a new File (not a URL)
    if (postToEdit.video && typeof postToEdit.video !== "string") {
      videoUrl = await handleMediaUpload(postToEdit.video);
    }

    const updatedPost = await editPost(postToEdit.id, {
      title: postToEdit.title,
      tagline: postToEdit.tagline,
      content: postToEdit.content,
      image: imageUrl || null,
      video: videoUrl || null,
      date: Timestamp.fromDate(new Date()),
    });

    if (updatedPost) {
      setPosts(posts.map((post) => (post.id === postToEdit.id ? updatedPost : post)));
    }

    setIsLoading(false);
    setShowEditModal(false);
    setPostToEdit(null);
  } catch (error) {
    console.error("Error updating post:", error);
    setIsLoading(false);
  }
};

  // const handleEditPost = async () => {
  //   setIsLoading(true);
  //   setEditErrors({});
  //   let validationErrors = {};
  //   // Validate required fields
  //   if (!postToEdit.title) validationErrors.title = "Title is required";
  //   if (!postToEdit.tagline) validationErrors.tagline = "Tagline is required";
  //   if (!postToEdit.content) validationErrors.content = "Content is required";
  //   if (Object.keys(validationErrors).length > 0) {
  //     setEditErrors(validationErrors);
  //     setIsLoading(false);
  //     return;
  //   }
  //   if (postToEdit) {
  //     let imageUrl = postToEdit.image;
  //     if (typeof postToEdit.image !== "string") {
  //       imageUrl = await handleImageUpload(postToEdit.image);
  //     }

  //     const updatedPost = await editPost(postToEdit.id, {
  //       title: postToEdit.title,
  //       tagline: postToEdit.tagline,
  //       content: postToEdit.content,
  //       image: imageUrl, // Use Cloudinary URL
  //       date: Timestamp.fromDate(new Date()),
  //     });

  //     if (updatedPost) {
  //       setPosts(
  //         posts.map((post) => (post.id === postToEdit.id ? updatedPost : post))
  //       );
  //     }
  //     setIsLoading(false);
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

  const openPostCreate = () => {
    setOpen(true);
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
      <h2 className="form-heading">Edit Post</h2>

      {/* ── title ───────────────────────────────────── */}
      <label style={{ color: "#48A6A7" }}>Enter post title</label>
      <input
        type="text"
        placeholder="Enter post title"
        value={postToEdit.title}
        onChange={(e) =>
          setPostToEdit({ ...postToEdit, title: e.target.value })
        }
      />
      {editErrors.title && <p className="error">{editErrors.title}</p>}

      {/* ── tagline ─────────────────────────────────── */}
      <label style={{ color: "#48A6A7" }}>Enter tagline</label>
      <input
        type="text"
        value={postToEdit.tagline}
        onChange={(e) =>
          setPostToEdit({ ...postToEdit, tagline: e.target.value })
        }
      />
      {editErrors.tagline && <p className="error">{editErrors.tagline}</p>}

      {/* ── content ─────────────────────────────────── */}
      <label style={{ color: "#48A6A7" }}>Enter content</label>
      <textarea
        value={postToEdit.content}
        onChange={(e) =>
          setPostToEdit({ ...postToEdit, content: e.target.value })
        }
      />
      {editErrors.content && <p className="error">{editErrors.content}</p>}

      {/* ── single picker for image OR video ────────── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          setPostToEdit({
            ...postToEdit,
            image: file.type.startsWith("image") ? file : null,
            video: file.type.startsWith("video") ? file : null,
          });
        }}
      />

      {/* ── preview section ─────────────────────────── */}
      {postToEdit.image && typeof postToEdit.image === "string" && (
        <img src={postToEdit.image} alt="preview" className="edit-video" />
      )}
      {postToEdit.video && typeof postToEdit.video === "string" && (
        <video
          src={postToEdit.video}
          controls
          className="edit-video"
          // style={{ maxWidth: "100%", marginTop: "10px" }}
        />
      )}

      {/* ── remove media button ─────────────────────── */}
      {(postToEdit.image || postToEdit.video) && (
        <button
          disabled={isLoading}
          style={{ margin: "10px 20px" }}
          className="delete-btn"
          onClick={() => {
            setPostToEdit({ ...postToEdit, image: null, video: null });
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        >
          Remove Media
        </button>
      )}

      {/* ── action buttons ──────────────────────────── */}
      <button
        disabled={isLoading}
        style={{ marginTop: "20px", marginRight: "20px" }}
        className="delete-btn"
        onClick={handleEditPost}
      >
        {isLoading ? <span className="loader"></span> : "Save Changes"}
      </button>
      <button
        disabled={isLoading}
        className="delete-btn"
        onClick={handleEditCancel}
      >
        Cancel
      </button>
    </div>
  </div>
)}

      {/* {showEditModal && postToEdit && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="form-heading">Edit Post</h2>
            <label style={{ color: "#48A6A7" }}>Enter post title</label>
            <input
              type="text"
              placeholder="Enter post title"
              value={postToEdit.title}
              onChange={(e) =>
                setPostToEdit({ ...postToEdit, title: e.target.value })
              }
            />
            {editErrors.title && <p className="error">{editErrors.title}</p>}
            <label style={{ color: "#48A6A7" }}>Enter tagline</label>
            <input
              type="text"
              value={postToEdit.tagline}
              onChange={(e) =>
                setPostToEdit({ ...postToEdit, tagline: e.target.value })
              }
            />
            {editErrors.tagline && (
              <p className="error">{editErrors.tagline}</p>
            )}
            <label style={{ color: "#48A6A7" }}>Enter content</label>
            <textarea
              value={postToEdit.content}
              onChange={(e) =>
                setPostToEdit({ ...postToEdit, content: e.target.value })
              }
            />
            {editErrors.content && (
              <p className="error">{editErrors.content}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) =>
                setPostToEdit({ ...postToEdit, image: e.target.files[0] })
              }
            />
            {postToEdit.image && (
              <button
                disabled={isLoading}
                style={{
                  marginRight: "20px",
                  marginLeft: "20px",
                  marginTop: "10px",
                }}
                className="delete-btn"
                onClick={handleRemoveImageEdit}
              >
                Remove Image
              </button>
            )}
            <button
              disabled={isLoading}
              style={{ marginTop: "20px", marginRight: "20px" }}
              className="delete-btn"
              onClick={handleEditPost}
            >
              {" "}
              {isLoading ? <span className="loader"></span> : "Save Changes"}
            </button>
            <button
              disabled={isLoading}
              className="delete-btn"
              onClick={handleEditCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )} */}
      {/* Add New Post Form */}
      {open ? (
        <div className="new-post-form">
          <h2 className="form-heading">Create New Post</h2>

          <input
            type="text"
            placeholder="Enter post title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          {errors.title && <p className="error">{errors.title}</p>}

          <input
            type="text"
            placeholder="Enter tagline"
            value={newPost.tagline}
            onChange={(e) =>
              setNewPost({ ...newPost, tagline: e.target.value })
            }
          />
          {errors.tagline && <p className="error">{errors.tagline}</p>}

          <textarea
            placeholder="Write your post content..."
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
          />
          {errors.content && <p className="error">{errors.content}</p>}

          {/* <input
            ref={fileInputRef} // Attach ref to the file input
            type="file"
            onChange={(e) =>
              setNewPost({ ...newPost, image: e.target.files[0] })
            }
          /> */}

          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              setNewPost({
                ...newPost,
                image: file.type.startsWith("image") ? file : null,
                video: file.type.startsWith("video") ? file : null,
              });
            }}
          />

          {/* Show "Remove Image" button if an image is uploaded */}
          {newPost.image && (
            <button
              disabled={isLoading}
              style={{
                marginRight: "20px",
                marginLeft: "20px",
                marginTop: "10px",
              }}
              className="delete-btn"
              onClick={handleRemoveMedia}
            >
              Remove Image
            </button>
          )}

          <button
            disabled={isLoading}
            style={{ marginTop: "20px" }}
            className="delete-btn"
            onClick={handleAddPost}
          >
            {isLoading ? <span className="loader"></span> : "Add New Post"}
          </button>

          {/* Clear Form Button */}
          <button
            disabled={isLoading}
            style={{
              margin: "20px",
            }}
            className="delete-btn"
            onClick={handleClearForm}
          >
            Clear Form
          </button>
        </div>
      ) : (
        ""
      )}

      <div className="posts-list">
        {loading ? (
          <p>Loading posts...</p>
        ) : (
          <>
            {open ? (
              <button
                style={{
                  marginBottom: "20px",
                }}
                className="delete-btn"
                onClick={handleFormHide}
              >
                Hide Form
              </button>
            ) : (
              <button
                style={{
                  marginBottom: "20px",
                }}
                className="delete-btn"
                onClick={() => openPostCreate(true)}
              >
                Create New Post
              </button>
            )}
            {/* table */}
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Tagline</th>
                    <th>Content</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPosts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        {post.image ? (
                          <img
                            src={post.image}
                            alt="Post"
                            className="post-image"
                          />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </td>
                      <td>{post.title}</td>
                      <td>{post.tagline}</td>
                      <td>{post.content}</td>
                      <td>
                        {post.date?.seconds
                          ? new Date(post.date.seconds * 1000).toDateString()
                          : "Date not available"}
                      </td>
                      <td>
                        <button
                          className="edit-btn post-actions"
                          onClick={() => openEditModal(post)}
                        >
                          Edit
                        </button>
                        <button
                          className="edit-btn post-actions"
                          onClick={() => openDeleteModal(post.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              style={{
                marginTop: "20px",
              }}
              className="delete-btn"
              onClick={logOut}
            >
              Log out
            </button>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <p
              style={{
                marginBottom: "20px",
              }}
            >
              Are you sure you want to delete this post?
            </p>
            <button onClick={handleDeletePost} className="confirm-btn">
              Yes, Delete
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {!loading && posts.length > postsPerPage && (
        <div className="pagination">
          {currentPage > 1 && (
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <FaArrowLeft /> Previous
            </button>
          )}
          {indexOfLastPost < posts.length && (
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next <FaArrowRight />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
