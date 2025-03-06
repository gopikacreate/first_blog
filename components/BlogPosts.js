"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLogin from "./loginPage";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { logOut } from "../lib/auth";

const BlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const postsPerPage = 3;
  const router = useRouter();

  useEffect(() => {
    async function fetchPosts() {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postData);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="blog-container">
      {/* Hidden Admin Trigger */}
      <div
        className="hidden-admin-trigger"
        onClick={() => {
          setShowLoginModal(true);
        }}
      ></div>

      {/* Admin Login Modal */}
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
          {currentPosts.map((post) => (
            <div key={post.id} className="blog-post">
              <p className="post-date">
                {post.date?.seconds
                  ? new Date(post.date.seconds * 1000).toDateString()
                  : "Date not available"}
              </p>
              <h2 className="post-title">{post.title}</h2>
              <p style={{ marginBottom: "10px" }} className="post-tagline">
                {post.tagline}
              </p>
              {post.image && (
                <img src={post.image} alt={post.title} className="blog-image" />
              )}
              <p
                style={{
                  marginTop: "10px",
                }}
                className="post-content"
              >
                {post.content}
              </p>
            </div>
          ))}
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
  );
};

export default BlogPosts;
