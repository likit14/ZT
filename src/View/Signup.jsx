import React, { useState } from 'react';
import axios from 'axios';
import img1 from '../Images/logo.png';
import tick from '../Images/tick.gif';
import Footer from '../Components/footerforlogin';
import '../Styles/Signup.css';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registeredUser, setRegisteredUser] = useState('');
    const [userId, setUserId] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { companyName, email, password, confirmPassword } = formData;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (!/[A-Z]/.test(password)) {
            setError('Password must contain at least one uppercase letter!');
            return;
        }

        if (!/[a-z]/.test(password)) {
            setError('Password must contain at least one lowercase letter!');
            return;
        }

        if (!/\d/.test(password)) {
            setError('Password must contain at least one digit!');
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setError('Password must contain at least one special character!');
            return;
        }

        try {
            const response = await axios.post('http://192.168.249.101:5000/register', { companyName, email, password });
            setRegistrationSuccess(true);
            setRegisteredUser(companyName);
            setUserId(response.data.userId);
            setFormData({
                companyName: '',
                email: '',
                password: '',
                confirmPassword: '',
            });
            setError('');
        } catch (err) {
            console.error(err);
            setError('Error registering user');
        }
    };

    const handleNavigate = () => {
        const loginDetails = {
            loginStatus: false
        };
        localStorage.setItem('loginDetails', JSON.stringify(loginDetails));
        navigate('/');
    };

    return (
        <>
            <div className='App'>
                <div className="registration-form">
                    <img src={img1} alt="Logo" className="logo" />
                    {registrationSuccess ? (
                        <div className="success-message">
                            <img src={tick} alt="Success Tick" className="tick" />
                            <h2>Registration Success</h2>
                            <p>Your account name is: <strong>{registeredUser}</strong></p>
                            <p>Please check your <b>Email</b> for your <b>UserID</b></p>
                            <div className="login-prompt">
                                <p>Please <Link to="/">login</Link> to continue</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Company Name:</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="Enter your company name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email address"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password:</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>
                            {error && <p className="error">{error}</p>}
                            <button type="submit">Register</button>
                        </form>
                    )}
                    {!registrationSuccess && (
                        <div className="login-prompt">
                            <p>or</p>
                            <a onClick={() => handleNavigate()}><Link to='/'>Already Registered?/Login</Link></a>
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
};

export default Signup;
