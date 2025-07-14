
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Phone, Lock } from "lucide-react"
import { auth } from "../config/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

import axios from "axios"
import 'bootstrap/dist/css/bootstrap.min.css'
import api, { getBaseUrl, getApiUrl } from "../config/api";
import { useRef } from "react"

export default function SignUp({ setIsAuthenticated }) {
  const navigate = useNavigate()
  const [phoneNumber, setPhoneNumber] = useState("376963653")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaVerifier = useRef(null);
  const [otp, setOtp] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  // Thêm state để ẩn form nhập số điện thoại sau khi gửi OTP
  const [phoneSent, setPhoneSent] = useState(false);

  const setupRecaptcha = () => {
    if (!recaptchaVerifier.current) {
      const recaptchaDiv = document.getElementById('recaptcha-container');
      if (!recaptchaDiv) {
        setError('Không tìm thấy recaptcha-container trong DOM!');
        return;
      }
      recaptchaVerifier.current = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'invisible',
          callback: (response) => {}
        },
        auth
      );
    }
  };
  
  // Hàm kiểm tra số điện thoại Việt Nam hợp lệ (9 số, không cần số 0 đầu)
  const isValidVNPhone = (phone) => /^[3|5|7|8|9][0-9]{8}$/.test(phone);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    // Kiểm tra số điện thoại hợp lệ trước khi gửi
    if (!isValidVNPhone(phoneNumber)) {
      setError("Số điện thoại không hợp lệ. Vui lòng nhập 9 số, không cần số 0 đầu, và đúng đầu số di động.");
      return;
    }
    setLoading(true);
    setupRecaptcha();
    if (!recaptchaVerifier.current) {
      setError("Không khởi tạo được RecaptchaVerifier!");
      setLoading(false);
      return;
    }
    // Ghép số quốc tế đúng chuẩn: +84 + phoneNumber
    const phoneToSend = "+84" + phoneNumber;
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneToSend, recaptchaVerifier.current);
      setConfirmationResult(confirmation);
      setShowOTPInput(true); // Hiển thị form nhập OTP
      setPhoneSent(true); // Ẩn form nhập số điện thoại
    } catch (err) {
      setError("Gửi OTP thất bại: " + err.message);
    }
    setLoading(false);
  };

  // Xử lý nhập OTP từng ô
  const handleOTPInput = (e, i) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length > 1) return;
    let newOtp = otp.split("");
    newOtp[i] = val;
    setOtp(newOtp.join("").padEnd(6, ""));
    // Tự động focus sang ô tiếp theo nếu nhập số
    if (val && i < 5) {
      const next = document.getElementById(`otp-input-${i + 1}`);
      if (next) next.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!confirmationResult) return;
    if (otp.length < 6) {
      setError("Vui lòng nhập đủ 6 số OTP.");
      return;
    }
    try {
      await confirmationResult.confirm(otp);
      // Xử lý đăng ký thành công ở đây
      setError("");
      alert("Xác thực OTP thành công!");
      // Chuyển hướng sang trang chat sau khi xác thực OTP thành công
      navigate('/chat');
    } catch (err) {
      setError("Xác thực OTP thất bại: " + err.message);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e6f3ff 0%, #b6dcfe 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "440px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        padding: "40px 30px"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ 
            fontSize: "48px", 
            fontWeight: "bold", 
            color: "#0068ff",
            marginBottom: "12px"
          }}>Zalo</h1>
          <div style={{ 
            color: "#081C36",
            fontSize: "16px",
            marginBottom: "4px"
          }}>Đăng ký tài khoản Zalo với số điện thoại</div>
          <div style={{ 
            color: "#7589A3",
            fontSize: "14px"
          }}>chat.zalo.me</div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid #E6E8EB",
          marginBottom: "24px"
        }}>
         
          
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: "12px",
            backgroundColor: "#FFF5F5",
            color: "#E53E3E",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

       

          <div>
            {/* Chỉ hiển thị form nhập số điện thoại nếu chưa gửi OTP */}
            {!phoneSent && (
              <form onSubmit={handleSendOTP}>
                {/* Phone Number Input */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{
                    display: "flex",
                    border: "1px solid #E6E8EB",
                    borderRadius: "6px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRight: "1px solid #E6E8EB",
                      background: "#F8F9FA"
                    }}>
                      <Phone size={20} color="#7589A3" />
                      <span style={{ marginLeft: "8px", color: "#081C36" }}>+84</span>
                      <span style={{ marginLeft: "4px", color: "#7589A3" }}>▼</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Số điện thoại (bỏ số 0 đầu)"
                      style={{
                        flex: 1,
                        border: "none",
                        padding: "12px",
                        outline: "none",
                        fontSize: "14px"
                      }}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, "").slice(0,9))}
                      required
                    />
                  </div>
                </div>

                {/* Login Button */}
                <button 
                  type="submit" 
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#0068FF",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "500",
                    marginBottom: "16px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1
                  }}
                  disabled={loading}
                >
                  {loading ? "Đang gửi mã OTP..." : "Đăng ký"}
                </button>
              </form>
            )}

            {/* OTP Input */}
            {showOTPInput && (
              <form onSubmit={handleVerifyOTP} style={{ marginTop: 20 }}>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={e => handleOTPInput(e, i)}
                      id={`otp-input-${i}`}
                      style={{
                        width: 40,
                        height: 40,
                        fontSize: 24,
                        textAlign: "center",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                      }}
                    />
                  ))}
                </div>
                <button type="submit" style={{ marginTop: 16 }}>Xác nhận OTP</button>
              </form>
            )}

            {/* Additional Options */}
            <div style={{ textAlign: "center" }}>
                <span style={{ color: "gray", fontSize: "14px" }}>
                Bằng việc bấm nút đăng ký, bạn đã đồng ý với các 
                </span>
              <a 
                href="#" 
                style={{
                  color: "black",
                  textDecoration: "none",
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px"
                }}
              > điều khoản sử dụng
              </a>
             
            </div>
          </div>
     

        {/* Login Link */}
        <div style={{ 
          textAlign: "center", 
          marginTop: "24px",
          fontSize: "14px"
        }}>
          <span style={{ color: "#7589A3" }}>Bạn đã có tài khoản? </span>
          <a 
            href="#" 
            style={{
              color: "#0068FF",
              textDecoration: "none"
            }}
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </a>
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  )
}
