import { useEffect, useState } from 'react';
import '../App.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Post = () => {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({});
    const [postContent, setPostContent] = useState('');
    const [posts, setPosts] = useState([]);
    const [editPostId, setEditPostId] = useState(null);
    const [editPostEnable, setEditPostEnable] = useState(false)

    useEffect(() => {
        const fetchUserDetailsAndPosts = async () => {
            try {
                const userResponse = await axios.get('/api/user');
                setUserDetails(userResponse.data);

                const postsResponse = await axios.get('/api/user/posts');
                setPosts(postsResponse.data.posts);
            } catch (error) {
                console.log('Could not get user details or posts', error);
            }
        };

        fetchUserDetailsAndPosts();
    }, []);

    const handleCreatePost = async () => {
        try {
            const response = await axios.post('/api/post', { content: postContent });
            setPosts((prevPosts) => [response?.data?.post, ...prevPosts]);
            setPostContent('');
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const handleLogOut = async () => {
        try {
            await axios.get('/api/logout');
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    async function toggleLikePost(postId) {

        try {
            const hasLiked = await axios.post(`/api/post/${postId}/like`)
            const updatedPost = hasLiked?.data?.post
            setPosts((prevPosts) => (
                prevPosts.map((post) => (
                    post._id === postId ? updatedPost : post
                ))
            ))

        } catch (error) {
            console.log("error while liking/unliking the post:", error)
        }

    }


    const handleEditPost = async (postId) => {
        console.log("postIdParameter::", postId)
        console.log("post_id:", posts)
        try {
            const response = await axios.put(`/api/post/${postId}`, { content: postContent });
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? { ...post, content: response.data.post.content } : post
                )
            );
            setEditPostEnable(false);
            setEditPostId(null);
            setPostContent('');
        } catch (error) {
            console.error('Error editing post:', error);
        }
    };



    console.log("posts::", posts)

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'end', marginTop: '10px' }}>
                <button style={{ backgroundColor: 'red', color: 'white', padding: '10px', borderRadius: '6px' }} onClick={handleLogOut}>Logout</button>
            </div>

            <h3 className='postPage' style={{ fontSize: '30px' }}>{`Hello ${userDetails.name || 'User'} 👋`}</h3>
            <p className='postPage'>Create a new post</p>
            <textarea
                name="post"
                id="post"
                placeholder="What is on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                style={{ padding: '10px', width: '40%', marginLeft: '20px', display: 'block', height: '100px' }}
            ></textarea>
            {editPostEnable ?
                <>
                    <button
                        onClick={() => handleEditPost(editPostId)}
                        style={{ padding: '10px', backgroundColor: '#F4CE14', color: 'black', marginLeft: '17px', marginTop: '10px', borderRadius: '6px', fontWeight: 'bold' }}
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setEditPostEnable(false)}
                        style={{ padding: '10px', backgroundColor: '#7F8C8D', color: 'white', borderRadius: '6px', fontWeight: 'bold' }}
                    >
                        Cancel
                    </button>
                </>
                :
                <button
                    style={{ padding: '13px', display: 'block', marginLeft: '20px', marginTop: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', backgroundColor: 'yellow', color: 'black' }}
                    onClick={handleCreatePost}
                >
                    Create a post
                </button>}

            <div style={{ marginLeft: '20px' }}>
                <h3>Your Posts 📑</h3>
                {posts.length > 0 ? (
                    posts.map((post) =>
                    (
                        <div key={post._id} className="postContainer" style={{ width: '40%', border: '1px solid #7F8C8D', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                            <p style={{ fontSize: '10px', color: '#007BFF', cursor: 'pointer' }}>@{userDetails.username}</p>
                            <p style={{ fontSize: '14px', textAlign: 'justify' }}>
                                {post.content}
                            </p>
                            <div className='likes' style={{ display: 'flex', gap: 20 }}>
                                <small>{post?.likes?.length} Like</small>
                                <small>{new Date(post.date).toLocaleString()}</small>
                            </div>
                            <div className="btns" style={{ display: 'flex', gap: 10 }}>
                                <p style={{ fontSize: '12px', color: '#007BFF', cursor: 'pointer' }}
                                    onClick={() => toggleLikePost(post._id)}>
                                    {post.likes.includes(userDetails?._id) ? 'Unlike' : 'Like'}
                                </p>

                                <p
                                    style={{ fontSize: '12px', cursor: 'pointer', color: '#7F8C8D' }}
                                    onClick={() => {
                                        setEditPostId(post._id);
                                        setPostContent(post.content);
                                        setEditPostEnable(true);
                                    }}
                                >
                                    Edit
                                </p>

                            </div>
                        </div>
                    ))
                ) : (
                    <p>No posts available</p>
                )}

            </div >
        </>
    );
};

export default Post;
