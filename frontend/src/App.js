import React, { useState, useContext, createContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./App.css";

// Import local image
import heroImage from './images/donation-bg.jpg';

// --- AUTHENTICATION CONTEXT ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        if (token) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
    }, [token]);

    const login = async (phoneNumber, password) => {
        try {
            // CORRECTED PATH
            const response = await axios.post('/api/users/login', { phoneNumber, password });
            if (response.data) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setToken(response.data.token);
                setUser(response.data.user);
                return true;
            }
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : error.message);
            return false;
        }
    };
    
    const register = async (name, phoneNumber, password) => {
        try {
            // CORRECTED PATH
            const response = await axios.post('/api/users/register', { name, phoneNumber, password });
            if (response.data) {
                return await login(phoneNumber, password);
            }
        } catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error.message);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const value = { isAuthenticated: !!token, user, token, login, register, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
    return useContext(AuthContext);
};


// --- REUSABLE COMPONENTS ---

function Header() {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    return (
        <header className="header">
            <h1>MultiFaith Donation</h1>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                {isAuthenticated ? (
                    <>
                        <span className="welcome-user">Welcome, {user?.name}!</span>
                        <button onClick={handleLogout} className="auth-btn">Logout</button>
                    </>
                ) : (
                    <Link to="/login" className="auth-btn">Login / Sign Up</Link>
                )}
            </nav>
        </header>
    );
}

function Footer() {
    return (
        <footer>
            <p>© 2025 MultiFaith Donation | <Link to="/about">About</Link> | <Link to="/contact">Contact</Link> | <Link to="/privacy">Privacy Policy</Link> | <Link to="/terms">Terms</Link></p>
        </footer>
    );
}


// --- CAUSE DETAILS PAGE COMPONENT ---
function CauseDetailsPage() {
    const { causeId } = useParams();
    const [cause, setCause] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // CORRECTED PATH
                const response = await axios.get('/api/religions');
                const allCauses = response.data.flatMap(r => r.causes);
                const foundCause = allCauses.find(c => c.id === causeId);
                if (foundCause) {
                    setCause(foundCause);
                } else {
                    setError('Cause not found.');
                }
            } catch (err) {
                setError('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [causeId]);

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}><h2>Loading...</h2></div>;
    if (error) return <div style={{ padding: '50px', textAlign: 'center' }}><h2>{error}</h2></div>;
    if (!cause) return <div style={{ padding: '50px', textAlign: 'center' }}><h2>Cause Not Found</h2></div>;

    return (
        <div className="cause-details-container">
            <h2>{cause.title} Details</h2>
            <p className="problem-description">{cause.problemDescription}</p>
            <p>{cause.fullDescription}</p>
            <div className="cause-images">
                {cause.images && cause.images.map((img, index) => (
                    <img key={index} src={img} alt={cause.title} className="cause-image" />
                ))}
            </div>
            {cause.mapLink && <a href={cause.mapLink} target="_blank" rel="noopener noreferrer" className="location-link">Location: {cause.location}</a>}
        </div>
    );
}


// --- PAGE COMPONENTS ---

function HomePage() {
    const [religions, setReligions] = useState([]);
    const [selectedReligionId, setSelectedReligionId] = useState(null);
    const selectedReligion = religions.find(r => r.id === selectedReligionId);

    useEffect(() => {
        const fetchReligions = async () => {
            try {
                // CORRECTED PATH
                const response = await axios.get('/api/religions');
                setReligions(response.data);
            } catch (error) {
                console.error("Error fetching religion data:", error);
            }
        };
        fetchReligions();
    }, []);

    return (
        <>
            <section className="hero" style={{ backgroundImage: `url("${heroImage}")` }}>
                <div className="hero-content">
                    <h2>Uniting Faiths Through Giving</h2>
                    <p>Optimize your donations across multiple faith-based charities and make a bigger impact together.</p>
                </div>
            </section>
            <section className="circle-section">
                <div className="circle-container">
                    {religions.map(religion => (
                        <div key={religion.id} className={`circle ${selectedReligionId === religion.id ? "active" : ""}`} onClick={() => setSelectedReligionId(religion.id)}>
                            <span className="icon">{religion.icon}</span>
                            <span>{religion.name}</span>
                        </div>
                    ))}
                </div>
            </section>
            {selectedReligion && (
                <section className="donation-section">
                    <h3>{selectedReligion.name} Donations</h3>
                    <div className="donation-cards">
                        {selectedReligion.causes.map((item, i) => (
                            <div key={i} className="card">
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                                <div className="card-buttons">
                                    <Link to="/donate" className="donate-button">Donate</Link>
                                    <Link to={`/causes/${item.id}`} className="details-button">Details</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}

function AboutPage() {
    return (
        <div className="about-page-container">
            <h2>About MultiFaith Donation</h2>
            <p className="about-intro">MultiFaith Donation is dedicated to creating a simple, transparent, and impactful way for people to support faith-based charities around the world. We believe in the power of collective giving to bring positive change.</p>
            <div className="about-section">
                <h3>Our Mission</h3>
                <p>Our mission is to bridge the gap between donors and deserving causes, ensuring that every contribution is meaningful. We aim to foster a community of givers who are passionate about supporting spiritual and community-driven initiatives.</p>
            </div>
            <div className="about-section">
                <h3>How It Works</h3>
                <p>1. <strong>Discover Causes:</strong> Browse through a curated list of causes associated with different faiths.<br />2. <strong>Learn More:</strong> Get detailed information about each project, its goals, and its impact.<br />3. <strong>Donate with Confidence:</strong> Contribute directly to the causes you care about through our secure platform.</p>
            </div>
        </div>
    );
}

function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const auth = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const success = await auth.login(phoneNumber, password);
        if (success) {
            navigate("/");
        } else {
            setError('Invalid phone number or password.');
        }
    };
    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                {error && <p className="login-error">{error}</p>}
                <div className="form-group"><label htmlFor="phone-number">Phone Number</label><input type="tel" id="phone-number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required /></div>
                <div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <div className="login-extras"><Link to="/forgot-password">Forgot Password?</Link></div>
                <button type="submit" className="login-submit-btn">Login</button>
                <div className="auth-switch"><p>Don't have an account? <Link to="/signup">Sign Up</Link></p></div>
            </form>
        </div>
    );
}

function SignUpPage() {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const auth = useAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const success = await auth.register(name, phoneNumber, password);
        if (success) {
            navigate("/");
        } else {
            setError('Registration failed. This phone number may already be in use.');
        }
    };
    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Create an Account</h2>
                {error && <p className="login-error">{error}</p>}
                <div className="form-group"><label htmlFor="name">Your Name</label><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div className="form-group"><label htmlFor="phone-number">Phone Number</label><input type="tel" id="phone-number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required /></div>
                <div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <button type="submit" className="login-submit-btn">Sign Up</button>
                <div className="auth-switch"><p>Already have an account? <Link to="/login">Login</Link></p></div>
            </form>
        </div>
    );
}

function ContactPage() {
    const handleFormSubmit = (e) => {
        e.preventDefault();
        alert("Thank you for your message! We will get back to you shortly.");
        e.target.reset();
    };
    return (
        <div className="contact-page-container">
            <h2>Contact Us</h2>
            <p className="contact-intro">Have a question or feedback? We'd love to hear from you. Reach out to us directly or fill out the form below.</p>
            <div className="contact-details">
                <h3>Our Information</h3>
                <p><strong>Email:</strong> <a href="mailto:mahajangargey8@gmail.com">mahajangargey8@gmail.com</a></p>
                <p><strong>Location:</strong> Pimpri-Chinchwad, Maharashtra, India</p>
            </div>
            <form className="contact-form" onSubmit={handleFormSubmit}>
                <h3>Send us a Message</h3>
                <div className="form-group"><label htmlFor="name">Your Name</label><input type="text" id="name" required /></div>
                <div className="form-group"><label htmlFor="email">Your Email</label><input type="email" id="email" required /></div>
                <div className="form-group"><label htmlFor="message">Message</label><textarea id="message" rows="6" required></textarea></div>
                <button type="submit" className="contact-submit-btn">Send Message</button>
            </form>
        </div>
    );
}

function PaymentPage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('upi');

    const handlePayment = async (e) => {
        e.preventDefault();
        const donationAmount = Number(amount);
        if (!donationAmount || donationAmount <= 0) {
            alert("Please enter a valid donation amount.");
            return;
        }
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            // CORRECTED PATH
            const response = await axios.post('/api/users/donate', { amount: donationAmount }, config);
            alert(response.data.message);
            navigate('/');
        } catch (error) {
            console.error('Donation error:', error.response ? error.response.data : error.message);
            alert('Donation failed. You may need to log in again.');
        }
    };
    
    return (
        <div className="payment-container">
            <h2>Complete Your Donation</h2>
            <form onSubmit={handlePayment} className="payment-box">
                <div className="payment-content">
                    <div className="form-group">
                        <label htmlFor="amount">Donation Amount (INR)</label>
                        <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" required />
                    </div>
                </div>
                <div className="payment-tabs">
                    <button type="button" className={`payment-tab ${paymentMethod === 'upi' ? 'active' : ''}`} onClick={() => setPaymentMethod('upi')}>UPI</button>
                    <button type="button" className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>Card</button>
                    <button type="button" className={`payment-tab ${paymentMethod === 'netbanking' ? 'active' : ''}`} onClick={() => setPaymentMethod('netbanking')}>Net Banking</button>
                </div>
                <div className="payment-content">
                    {paymentMethod === 'upi' && (<div><div className="form-group"><label htmlFor="upi-id">UPI ID</label><input type="text" id="upi-id" placeholder="yourname@bank" /></div></div>)}
                    {paymentMethod === 'card' && (<div><div className="form-group"><label htmlFor="card-number">Card Number</label><input type="text" id="card-number" placeholder="1234 5678 9101 1121" /></div><div className="form-row"><div className="form-group"><label htmlFor="expiry">Expiry (MM/YY)</label><input type="text" id="expiry" placeholder="08/28" /></div><div className="form-group"><label htmlFor="cvc">CVC</label><input type="text" id="cvc" placeholder="123" /></div></div><div className="form-group"><label htmlFor="card-name">Name on Card</label><input type="text" id="card-name" placeholder="Gargey Mahajan" /></div></div>)}
                    {paymentMethod === 'netbanking' && (<div><div className="form-group"><label htmlFor="bank-select">Select Your Bank</label><select id="bank-select" className="bank-select"><option value="">-- Choose a bank --</option><option value="sbi">State Bank of India</option><option value="hdfc">HDFC Bank</option></select></div></div>)}
                    <button type="submit" className="payment-submit-btn">Donate Now</button>
                </div>
            </form>
        </div>
    );
}


// --- MAIN APP COMPONENT ---

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="app">
                    <Header />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/causes/:causeId" element={<CauseDetailsPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/donate" element={<PaymentPage />} />
                        <Route path="/privacy" element={<div style={{ padding: '50px' }}><h1>Privacy Policy Page Coming Soon!</h1></div>} />
                        <Route path="/terms" element={<div style={{ padding: '50px' }}><h1>Terms Page Coming Soon!</h1></div>} />
                    </Routes>
                    <Footer />
                </div>
            </AuthProvider>
        </Router>
    );
}