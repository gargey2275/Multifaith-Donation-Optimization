import React, { useState, useContext, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import "./App.css";

// Import local image and data
import heroImage from './images/donation-bg.jpg';
import { religions } from './data';

// --- Authentication Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = (phoneNumber, password) => {
        if (phoneNumber === "9876543210" && password === "password") {
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
    };

    const value = { isAuthenticated, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
    return useContext(AuthContext);
};


// --- Reusable Components ---

function Header() {
    const { isAuthenticated, logout } = useAuth();
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
                    <button onClick={handleLogout} className="auth-btn">Logout</button>
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
            <p>© 2025 MultiFaith Donation |
                <Link to="/about">About</Link> |
                <Link to="/contact">Contact</Link> |
                <Link to="/privacy">Privacy Policy</Link> |
                <Link to="/terms">Terms</Link>
            </p>
        </footer>
    );
}

// --- Cause Details Page Component ---
function CauseDetailsPage() {
    const { causeId } = useParams();
    const foundCause = religions.flatMap(r => r.causes).find(c => c.id === causeId);

    if (!foundCause) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <h2>Cause Not Found</h2>
                <p>The cause you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="cause-details-container">
            <h2>{foundCause.title} Details</h2>
            <p className="problem-description">{foundCause.problemDescription}</p>
            <p>{foundCause.fullDescription}</p>
            <div className="cause-images">
                {foundCause.images && foundCause.images.map((img, index) => (
                    <img key={index} src={img} alt={foundCause.title} className="cause-image" />
                ))}
            </div>
            {foundCause.mapLink && <a href={foundCause.mapLink} target="_blank" rel="noopener noreferrer" className="location-link">Location: {foundCause.location}</a>}
        </div>
    );
}

// --- Page Components ---

function HomePage() {
    const [selectedReligionId, setSelectedReligionId] = useState(null);
    const selectedReligion = religions.find(r => r.id === selectedReligionId);

    return (
        <>
            {/* Hero Section */}
            <section
                className="hero"
                style={{ backgroundImage: `url("${heroImage}")` }}
            >
                <div className="hero-content">
                    <h2>Uniting Faiths Through Giving</h2>
                    <p>Optimize your donations across multiple faith-based charities and make a bigger impact together.</p>
                </div>
            </section>

            {/* Religion Selector */}
            <section className="circle-section">
                <div className="circle-container">
                    {religions.map(religion => (
                        <div
                            key={religion.id}
                            className={`circle ${selectedReligionId === religion.id ? "active" : ""}`}
                            onClick={() => {
                                setSelectedReligionId(religion.id);
                            }}
                        >
                            <span className="icon">{religion.icon}</span>
                            <span>{religion.name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Donation Section */}
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
                                    <Link to={`/causes/${item.id}`} className="details-button">
                                        Details
                                    </Link>
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
            <p className="about-intro">
                MultiFaith Donation is dedicated to creating a simple, transparent, and impactful way for people to support faith-based charities around the world. We believe in the power of collective giving to bring positive change.
            </p>
            <div className="about-section">
                <h3>Our Mission</h3>
                <p>
                    Our mission is to bridge the gap between donors and deserving causes, ensuring that every contribution is meaningful. We aim to foster a community of givers who are passionate about supporting spiritual and community-driven initiatives.
                </p>
            </div>
            <div className="about-section">
                <h3>How It Works</h3>
                <p>
                    1. <strong>Discover Causes:</strong> Browse through a curated list of causes associated with different faiths.
                    <br />
                    2. <strong>Learn More:</strong> Get detailed information about each project, its goals, and its impact.
                    <br />
                    3. <strong>Donate with Confidence:</strong> Contribute directly to the causes you care about through our secure platform.
                </p>
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const success = auth.login(phoneNumber, password);
        if (success) {
            navigate("/");
        } else {
            setError("Invalid phone number or password. (Hint: 9876543210 / password)");
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                {error && <p className="login-error">{error}</p>}
                <div className="form-group">
                    <label htmlFor="phone-number">Phone Number</label>
                    <input
                        type="tel"
                        id="phone-number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        pattern="[0-9]{10}"
                        title="Please enter a 10-digit phone number"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-submit-btn">Login</button>
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
            <p className="contact-intro">
                Have a question or feedback? We'd love to hear from you. Reach out to us directly or fill out the form below.
            </p>
            <div className="contact-details">
                <h3>Our Information</h3>
                <p>
                    <strong>Email:</strong> <a href="mailto:mahajangargey8@gmail.com">mahajangargey8@gmail.com</a>
                </p>
                <p>
                    <strong>Location:</strong> Pimpri-Chinchwad, Maharashtra, India
                </p>
            </div>
            <form className="contact-form" onSubmit={handleFormSubmit}>
                <h3>Send us a Message</h3>
                <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input type="text" id="name" required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Your Email</label>
                    <input type="email" id="email" required />
                </div>
                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" rows="6" required></textarea>
                </div>
                <button type="submit" className="contact-submit-btn">Send Message</button>
            </form>
        </div>
    );
}

// --- NEW: Payment Page Component ---
function PaymentPage() {
    const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'netbanking'

    const handlePayment = (e) => {
        e.preventDefault();
        alert("Thank you for your donation! (This is a demo and no real payment was processed).");
    };

    return (
        <div className="payment-container">
            <h2>Complete Your Donation</h2>
            <div className="payment-box">
                <div className="payment-tabs">
                    <button
                        className={`payment-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('upi')}
                    >
                        UPI
                    </button>
                    <button
                        className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('card')}
                    >
                        Card
                    </button>
                    <button
                        className={`payment-tab ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('netbanking')}
                    >
                        Net Banking
                    </button>
                </div>

                <div className="payment-content">
                    {paymentMethod === 'upi' && (
                        <form onSubmit={handlePayment}>
                            <div className="form-group">
                                <label htmlFor="upi-id">UPI ID</label>
                                <input type="text" id="upi-id" placeholder="yourname@bank" required />
                            </div>
                            <button type="submit" className="payment-submit-btn">Pay Now</button>
                        </form>
                    )}

                    {paymentMethod === 'card' && (
                        <form onSubmit={handlePayment}>
                            <div className="form-group">
                                <label htmlFor="card-number">Card Number</label>
                                <input type="text" id="card-number" placeholder="1234 5678 9101 1121" required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="expiry">Expiry (MM/YY)</label>
                                    <input type="text" id="expiry" placeholder="08/28" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="cvc">CVC</label>
                                    <input type="text" id="cvc" placeholder="123" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="card-name">Name on Card</label>
                                <input type="text" id="card-name" placeholder="Gargey Mahajan" required />
                            </div>
                            <button type="submit" className="payment-submit-btn">Pay Now</button>
                        </form>
                    )}

                    {paymentMethod === 'netbanking' && (
                        <form onSubmit={handlePayment}>
                            <div className="form-group">
                                <label htmlFor="bank-select">Select Your Bank</label>
                                <select id="bank-select" className="bank-select" required>
                                    <option value="">-- Choose a bank --</option>
                                    <option value="sbi">State Bank of India</option>
                                    <option value="hdfc">HDFC Bank</option>
                                    <option value="icici">ICICI Bank</option>
                                    <option value="axis">Axis Bank</option>
                                    <option value="kotak">Kotak Mahindra Bank</option>
                                </select>
                            </div>
                            <button type="submit" className="payment-submit-btn">Proceed to Bank</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Main App Component ---

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
                        <Route path="/donate" element={<PaymentPage />} /> {/* New Route */}
                        <Route path="/privacy" element={<div style={{ padding: '50px' }}><h1>Privacy Policy Page Coming Soon!</h1></div>} />
                        <Route path="/terms" element={<div style={{ padding: '50px' }}><h1>Terms Page Coming Soon!</h1></div>} />
                    </Routes>
                    <Footer />
                </div>
            </AuthProvider>
        </Router>
    );
}