// src/View/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import img1 from '../Images/logo.png';
import Footer from '../Components/footerforlogin';
import '../Styles/Login.css';
import { Link } from 'react-router-dom';

const Login = (props) => {
  const {checkLogin}=props
  // const navigate=useNavigate()
  const [formData, setFormData] = useState({
    id: '',
    companyName: '',
    password: ''
  });

  const [error, setError] = useState('');


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, companyName, password } = formData;

    try {
      const response = await axios.post('http://192.168.249.101:5000/api/login', { id, companyName, password });
      if (response.data.success) {
        const loginDetails={
          loginStatus:true,
          data:response.data.data
        }
        localStorage.setItem('loginDetails',JSON.stringify(loginDetails))
        checkLogin(true)
        console.log(response)
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    }
  };
  

  return (
    <>
    <div className='App'>
    <div className="login-form">
      <img src={img1} alt="Logo" className="logo" />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>User ID:</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            placeholder="Enter your user ID"
            required
          />
        </div>
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
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <div className="login-prompt">
        <p>or</p>
        <p><Link to="/signup">Not registered?/Sign up</Link></p>
      </div>
    </div>
    </div>
    <Footer/>
    </>
  );
};

export default Login;
