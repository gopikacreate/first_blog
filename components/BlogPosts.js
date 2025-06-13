"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLogin from "./loginPage";
import { FaArrowLeft, FaArrowRight, FaEdit, FaTrash } from "react-icons/fa";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAILS = [
  "gopikagopakumar0799@gmail.com",
  "gopikagnair018@gmail.com",
  "sachinvijayd13@gmail.com",
];

const BlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({
    postId: null,
    commentId: null,
  });

  const postsPerPage = 3;
  const router = useRouter();

  useEffect(() => {
    async function fetchPosts() {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const commentsSnapshot = await getDocs(
            collection(db, "posts", doc.id, "comments")
          );
          const comments = commentsSnapshot.docs.map((c) => ({
            id: c.id,
            ...c.data(),
          }));
          return { id: doc.id, ...doc.data(), comments };
        })
      );

      // 🆕 Sort posts by date (latest first)
      postData.sort((a, b) => {
        const dateA = a.date?.seconds || 0;
        const dateB = b.date?.seconds || 0;
        return dateB - dateA; // descending order
      });

      setPosts(postData);
      setFilteredPosts(postData);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  // useEffect(() => {
  //   async function fetchPosts() {
  //     const querySnapshot = await getDocs(collection(db, "posts"));
  //     const postData = await Promise.all(
  //       querySnapshot.docs.map(async (doc) => {
  //         const commentsSnapshot = await getDocs(
  //           collection(db, "posts", doc.id, "comments")
  //         );
  //         const comments = commentsSnapshot.docs.map((c) => ({
  //           id: c.id,
  //           ...c.data(),
  //         }));
  //         return { id: doc.id, ...doc.data(), comments };
  //       })
  //     );
  //     setPosts(postData);
  //     setFilteredPosts(postData);
  //     setLoading(false);
  //   }
  //   fetchPosts();
  // }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && ADMIN_EMAILS.includes(currentUser.email)) {
        setIsAdmin(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFilter = () => {
    let filtered = posts;
    if (selectedDate) {
      filtered = filtered.filter(
        (post) =>
          new Date(post.date.seconds * 1000).toDateString() ===
          new Date(selectedDate).toDateString()
      );
    }

    if (searchKeyword) {
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
    setFilteredPosts(filtered);
    setCurrentPage(1);
  };
  const handleReset = () => {
    setSelectedDate("");
    setSearchKeyword("");
    setFilteredPosts(posts);
    setCurrentPage(1);
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim() || !user) return;
    setIsProcessing(true);
    const commentRef = collection(db, "posts", postId, "comments");
    await addDoc(commentRef, {
      text: commentText,
      createdAt: new Date(),
    });
    setCommentText("");
    setCommentingPostId(null);
    setIsProcessing(false);
    setConfirmationMessage("Comment posted successfully.");
    setTimeout(() => setConfirmationMessage(""), 2000);
    location.reload();
  };

  const handleCommentDelete = async () => {
    const { postId, commentId } = confirmDelete;
    if (!postId || !commentId) return;
    setDeleteLoadingId(commentId);
    // const confirmed = window.confirm("Are you sure you want to delete this comment?");
    // if (!confirmed) return;
    setIsProcessing(true);
    const commentDocRef = doc(db, "posts", postId, "comments", commentId);
    await deleteDoc(commentDocRef);
    setDeleteLoadingId(null);
    setIsProcessing(false);
    setConfirmationMessage("Comment deleted successfully.");
    setTimeout(() => setConfirmationMessage(""), 2000);
    location.reload();
  };

  const handleCommentEdit = async (postId, commentId) => {
    setIsProcessing(true);
    const commentDocRef = doc(db, "posts", postId, "comments", commentId);
    await updateDoc(commentDocRef, {
      text: editingCommentText,
    });
    setEditingCommentId(null);
    setEditingCommentText("");
    setIsProcessing(false);
    setConfirmationMessage("Comment updated successfully.");
    setTimeout(() => setConfirmationMessage(""), 2000);
    location.reload();
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="blog-container">
      {confirmationMessage && (
        <div className="confirmation-box">{confirmationMessage}</div>
      )}

      {confirmDelete.postId && (
        <div className="confirm-modal">
          <div className="confirm-box">
            <p>Are you sure you want to delete this comment?</p>
            <div className="confirm-actions">
              <button
                onClick={() =>
                  setConfirmDelete({ postId: null, commentId: null })
                }
              >
                Cancel
              </button>
              <button
                onClick={handleCommentDelete}
                disabled={deleteLoadingId !== null}
              >
                {deleteLoadingId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className="hidden-admin-trigger"
        onClick={() => {
          setShowLoginModal(true);
        }}
      ></div>

      {showLoginModal && (
        <div
          className="admin-login-overlay"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="admin-login-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <p>Admin Login</p>
            <AdminLogin />
            <button onClick={() => setShowLoginModal(false)}>Close</button>
          </div>
        </div>
      )}

      <h1 className="main-heading">Simply Scribbled</h1>
      <h2 className="main-tagline">
        Words, memories, and everything in between.
      </h2>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="filter-box">
            {/* <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            /> */}

            <div className="filter-field">
              <label htmlFor="datePicker" className="post-date">
                Select Date
              </label>
              <input
                id="datePicker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="filter-input"
              />
            </div>

            <input
              type="text"
              placeholder="Search by title keyword"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button
              style={{ marginRight: "10px" }}
              className="filter-button"
              onClick={handleFilter}
            >
              Filter
            </button>
            <button className="filter-button" onClick={handleReset}>
              Reset
            </button>
          </div>
          {filteredPosts.length === 0 ? (
            <p style={{ marginTop: "20px", fontStyle: "italic" }}>
              No posts match your filter criteria.
            </p>
          ) : (
            currentPosts.map((post) => (
              <div key={post.id} className="blog-post">
                <p className="post-date">
                  {post.date?.seconds
                    ? new Date(post.date.seconds * 1000).toDateString()
                    : "Date not available"}
                </p>
                <h2 className="post-title">{post.title}</h2>
                <p className="post-tagline">{post.tagline}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="blog-image"
                  />
                )}

                {post.video && (
                  <video
                    src={post.video}
                    controls
                    playsInline
                    className="blog-video"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "400px",
                      objectFit: "contain", // ✅ switch from cover to contain
                      borderRadius: "10px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      marginTop: "10px",
                    }}
                  />

                  // <video
                  //   src={post.video}
                  //   controls
                  //   className="blog-video"
                  //   style={{ maxWidth: "100%", margin: "20px 0" }}
                  // />
                )}
                <p className="post-content">{post.content}</p>

                <div className="comment-section">
                  <h3>Comments</h3>
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="single-comment"
                        style={{
                          backgroundColor: "#f9f9f9",
                          padding: "10px",
                          marginBottom: "10px",
                          borderRadius: "8px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                          position: "relative",
                        }}
                      >
                        {editingCommentId === comment.id ? (
                          <>
                            <textarea
                              value={editingCommentText}
                              onChange={(e) =>
                                setEditingCommentText(e.target.value)
                              }
                            />
                            <button
                              style={{ marginRight: "10px" }}
                              onClick={() =>
                                handleCommentEdit(post.id, comment.id)
                              }
                              disabled={isProcessing}
                            >
                              {isProcessing ? "Saving..." : "Save"}
                            </button>
                            <button onClick={() => setEditingCommentId(null)}>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <p style={{ marginBottom: "4px" }}>
                              {comment.text}
                            </p>
                            <small style={{ display: "block", color: "#555" }}>
                              {comment.createdAt?.seconds
                                ? new Date(
                                    comment.createdAt.seconds * 1000
                                  ).toLocaleString()
                                : "Just now"}
                            </small>
                            {isAdmin && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "10px",
                                  right: "10px",
                                  display: "flex",
                                  gap: "10px",
                                }}
                              >
                                <FaEdit
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditingCommentText(comment.text);
                                  }}
                                />
                                <FaTrash
                                  style={{ cursor: "pointer" }}
                                  // onClick={() => handleCommentDelete(post.id, comment.id)}
                                  onClick={() =>
                                    setConfirmDelete({
                                      postId: post.id,
                                      commentId: comment.id,
                                    })
                                  }
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}

                  {user && (
                    <>
                      <textarea
                        placeholder="Leave a comment..."
                        value={commentingPostId === post.id ? commentText : ""}
                        onChange={(e) => {
                          setCommentingPostId(post.id);
                          setCommentText(e.target.value);
                        }}
                      ></textarea>
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Posting..." : "Post"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          {!loading && filteredPosts.length > postsPerPage && (
            <div className="pagination">
              {currentPage > 1 && (
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  <FaArrowLeft /> Previous
                </button>
              )}
              {indexOfLastPost < filteredPosts.length && (
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next <FaArrowRight />
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogPosts;
