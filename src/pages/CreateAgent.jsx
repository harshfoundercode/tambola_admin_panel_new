import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaUserTie, FaUser, FaWhatsapp, FaTelegram,
  FaSms, FaEnvelope, FaFacebook, FaLock, FaPaperPlane, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { createAgentAPI, updateAgentAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/createAgent.css';

const FIELDS = [
  { name: 'name',              label: 'Full Name',         type: 'text',     icon: FaUser,     required: true,  placeholder: 'e.g. Rahul Sharma' },
  { name: 'whatsapp_number',   label: 'WhatsApp Number',   type: 'tel',      icon: FaWhatsapp, required: true,  placeholder: 'e.g. 9876543210' },
  { name: 'telegram_username', label: 'Telegram Username', type: 'text',     icon: FaTelegram, required: false, placeholder: 'e.g. rahul_tg' },
  { name: 'sms_number',        label: 'SMS Number',        type: 'tel',      icon: FaSms,      required: false, placeholder: 'e.g. 9876543210' },
  { name: 'email',             label: 'Email Address',     type: 'email',    icon: FaEnvelope, required: false, placeholder: 'e.g. rahul@gmail.com' },
  { name: 'facebook_id',       label: 'Facebook ID',       type: 'text',     icon: FaFacebook, required: false, placeholder: 'e.g. rahul.sharma' },
];

function validate(form, isEdit) {
  const errs = {};
  
  // Name validation
  if (!form.name.trim()) errs.name = 'Name is required';
  else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
  else if (!/^[a-zA-Z\s]+$/.test(form.name.trim())) errs.name = 'Name can only contain letters and spaces';
  
  // WhatsApp number validation
  if (!form.whatsapp_number.trim()) errs.whatsapp_number = 'WhatsApp number is required';
  else if (!/^\d{10}$/.test(form.whatsapp_number)) errs.whatsapp_number = 'Enter valid 10-digit number';
  
  // SMS number validation
  if (form.sms_number && !/^\d{10}$/.test(form.sms_number)) errs.sms_number = 'Enter valid 10-digit number';
  
  // Email validation
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter valid email address';
  
  // Telegram username validation
  if (form.telegram_username && !/^@?[a-zA-Z0-9_.]{5,32}$/.test(form.telegram_username)) {
    errs.telegram_username = 'Username must be 5-32 characters (can start with @, letters, numbers, underscore, dot allowed)';
  }
  
  // Facebook ID validation
  if (form.facebook_id && form.facebook_id.length < 3) errs.facebook_id = 'Facebook ID must be at least 3 characters';
  
  // Password validation - only for create mode
  if (!isEdit) {
    if (!form.password.trim()) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      errs.password = 'Password must contain uppercase, lowercase and number';
    }
    
    if (!form.confirmPassword.trim()) errs.confirmPassword = 'Please confirm password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
  }
  
  return errs;
}

export default function CreateAgent() {
  const location = useLocation();
  const navigate = useNavigate();
  const editData = location.state || null;
  const isEdit   = !!editData?.agent_id;

  const [form, setForm] = useState({
    name:               editData?.name              || '',
    whatsapp_number:    editData?.whatsapp_number   || '',
    telegram_username:  editData?.telegram_username || '',
    sms_number:         editData?.sms_number        || '',
    email:              editData?.email             || '',
    facebook_id:        editData?.facebook_id       || '',
    password:           isEdit ? (editData?.password || '') : '',
    confirmPassword:    isEdit ? (editData?.password || '') : '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Number field validation
    if ((name === 'whatsapp_number' || name === 'sms_number') && !/^\d*$/.test(value)) return;
    if ((name === 'whatsapp_number' || name === 'sms_number') && value.length > 10) return;
    
    // Name field validation
    if (name === 'name' && !/^[a-zA-Z\s]*$/.test(value)) return;
    
    // For password field in edit mode - update confirm password automatically
    if (name === 'password' && isEdit) {
      setForm(f => ({ ...f, [name]: value, confirmPassword: value }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
    
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Submitting form...');
    console.log('Is Edit Mode:', isEdit);
    console.log('Form Data:', form);
    console.log('Edit Data:', editData);
    
    const errs = validate(form, isEdit);
    if (Object.keys(errs).length) { 
      console.log('❌ Validation errors:', errs);
      setErrors(errs); 
      return; 
    }
    
    setLoading(true);
    try {
      let payload;
      
      if (isEdit) {
        // For update: Send ALL data including agent_id
        payload = {
          agent_id: editData.agent_id,
          name: form.name,
          whatsapp_number: form.whatsapp_number,
          telegram_username: form.telegram_username,
          sms_number: form.sms_number,
          email: form.email,
          facebook_id: form.facebook_id,
          password: form.password, // ✅ ALWAYS send password (existing or new)
        };
        
        console.log('📤 UPDATE Payload:', payload);
        console.log('Password being sent:', payload.password);
        console.log('agent_id type:', typeof payload.agent_id);
        console.log('agent_id value:', payload.agent_id);
        
        if (!payload.agent_id) {
          throw new Error('Agent ID is missing! Cannot update agent.');
        }
        
      } else {
        // For create: No agent_id
        payload = {
          name: form.name,
          whatsapp_number: form.whatsapp_number,
          telegram_username: form.telegram_username,
          sms_number: form.sms_number,
          email: form.email,
          facebook_id: form.facebook_id,
          password: form.password,
        };
        
        console.log('📤 CREATE Payload:', payload);
      }
      
      // Remove confirmPassword if it exists
      delete payload.confirmPassword;
      
      console.log('📤 FINAL Payload being sent:', payload);
      
      const res = isEdit 
        ? await updateAgentAPI(payload) 
        : await createAgentAPI(payload);
      
      console.log('✅ API Response:', res);
      toast.success(res.message || (isEdit ? 'Agent updated successfully!' : 'Agent created successfully!'));
      
      if (isEdit) {
        navigate('/agents');
      } else {
        setForm({ 
          name: '', whatsapp_number: '', telegram_username: '', 
          sms_number: '', email: '', facebook_id: '', 
          password: '', confirmPassword: '' 
        }); 
        setErrors({}); 
        setShowPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (err) {
      console.error('❌ API Error Details:', {
        message: err.message,
        response: err.response,
        responseData: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err?.response?.data?.message || err?.message || 'Something went wrong.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="cag-wrapper">
      <div className="cag-card">

        {/* Header */}
        <div className="cag-header">
          <div className="cag-header-icon"><FaUserTie size={22} /></div>
          <div>
            <h2>{isEdit ? 'Update Agent' : 'Create New Agent'}</h2>
            <p>{isEdit ? `Editing: ${editData.name}` : 'Fill in the details to register a new agent'}</p>
          </div>
        </div>

        {/* Form */}
        <form className="cag-form" onSubmit={handleSubmit} noValidate>
          {FIELDS.map(({ name, label, type, icon: Icon, required, placeholder }) => (
            <div className="cag-field" key={name}>
              <label>
                {label}
                {required && <span>*</span>}
              </label>
              <div className="cag-input-wrap">
                <span className="cag-icon"><Icon size={14} /></span>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  autoComplete="off"
                  className={errors[name] ? 'input-error' : ''}
                />
              </div>
              {errors[name] && <span className="cag-error">{errors[name]}</span>}
            </div>
          ))}
          
          {/* Password Field - Show for both Create and Update */}
          <div className="cag-field">
            <label>
              Password 
              {!isEdit && <span>*</span>}
            </label>
            <div className="cag-input-wrap">
              <span className="cag-icon"><FaLock size={14} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={isEdit ? "Current password" : "Min. 6 characters with uppercase, lowercase & number"}
                autoComplete="off"
                className={errors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="cag-password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {errors.password && <span className="cag-error">{errors.password}</span>}
            {isEdit && (
              <span style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px', display: 'block' }}>
                💡 You can change the password by typing a new one here
              </span>
            )}
          </div>
          
          {/* Confirm Password Field - Show for both Create and Update */}
          <div className="cag-field">
            <label>
              Confirm Password
              {!isEdit && <span>*</span>}
            </label>
            <div className="cag-input-wrap">
              <span className="cag-icon"><FaLock size={14} /></span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder={isEdit ? "Confirm password" : "Re-enter your password"}
                autoComplete="off"
                className={errors.confirmPassword ? 'input-error' : ''}
                readOnly={isEdit}
              />
              <button
                type="button"
                className="cag-password-toggle"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="cag-error">{errors.confirmPassword}</span>}
          </div>
        </form>

        {/* Footer */}
        <div className="cag-footer">
          <button
            type="button"
            className="cag-btn-reset"
            onClick={() => isEdit ? navigate('/agents') : (setForm({ name:'', whatsapp_number:'', telegram_username:'', sms_number:'', email:'', facebook_id:'', password:'', confirmPassword:'' }), setErrors({}), setShowPassword(false), setShowConfirmPassword(false))}
          >
            {isEdit ? 'Cancel' : 'Reset'}
          </button>
          <button type="submit" className="cag-btn-submit" disabled={loading} onClick={handleSubmit}>
            {loading ? (
              <><div className="cag-spinner" /> {isEdit ? 'Updating...' : 'Creating...'}</>
            ) : (
              <><FaPaperPlane size={13} /> {isEdit ? 'Update Agent' : 'Create Agent'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}