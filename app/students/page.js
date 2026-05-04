"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Trash2, UserPlus, QrCode } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    email: "",
    phone: "",
  });
  const [qrPreview, setQrPreview] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [manualQrText, setManualQrText] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    fetchStudents();
    generateFormQRCode();
    return () => stopScan();
  }, []);

  useEffect(() => {
    generateFormQRCode();
  }, [formData]);

  const fetchStudents = async () => {
    const res = await fetch("/api/students");
    const data = await res.json();
    setStudents(data);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await registerStudent(formData);
  };

  const registerStudent = async (student) => {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });

    if (res.ok) {
      setFormData({ name: "", studentId: "", email: "", phone: "" });
      setManualQrText("");
      fetchStudents();
      return true;
    }

    return false;
  };

  const deleteStudent = async (id) => {
    if (confirm("Энэ оюутныг устгахдаа итгэлтэй байна уу?")) {
      const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchStudents();
    }
  };

  const generateFormQRCode = async () => {
    try {
      const qrText = JSON.stringify(formData);
      const url = await QRCode.toDataURL(qrText);
      setQrPreview(url);
    } catch (err) {
      console.error(err);
      setQrPreview("");
    }
  };

  const startScan = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanMessage("Камерын нэвтрэх боломжгүй байна.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      setScanMessage("QR дээр камерыг чиглүүлнэ үү...");
      scanIntervalRef.current = window.setInterval(scanFrame, 500);
    } catch (err) {
      setScanMessage("Камераа нээж чадсангүй: " + err.message);
    }
  };

  const stopScan = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setScanning(false);
  };

  const scanFrame = async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if ("BarcodeDetector" in window) {
      try {
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const barcodes = await detector.detect(canvas);
        if (barcodes.length > 0) {
          stopScan();
          handleQRCode(barcodes[0].rawValue);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const parseQrData = (rawValue) => {
    try {
      return JSON.parse(rawValue);
    } catch {
      const parts = rawValue.split("|");
      if (parts.length >= 2) {
        return {
          name: parts[0] || "",
          studentId: parts[1] || "",
          email: parts[2] || "",
          phone: parts[3] || "",
        };
      }
    }
    return null;
  };

  const handleQRCode = async (rawValue) => {
    const parsed = parseQrData(rawValue);

    if (!parsed?.studentId) {
      setScanMessage(
        "QR кодноос оюутны код уншихад алдаа гарлаа. Та гараар оруулна уу.",
      );
      return;
    }

    setScanMessage(`QR-аас олдсон код: ${parsed.studentId}. Бүртгэж байна...`);
    const ok = await registerStudent(parsed);

    if (ok) {
      setScanMessage("Оюутан QR-аар амжилттай бүртгэгдлээ!");
      setTimeout(() => setScanMessage(""), 3000);
    } else {
      setScanMessage("Оюутан бүртгэхэд алдаа гарлаа.");
    }
  };

  const handleManualQrSubmit = async (e) => {
    e.preventDefault();
    if (!manualQrText.trim()) return;
    handleQRCode(manualQrText.trim());
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Оюутны удирдлага</h1>
        <p className="text-gray-600">
          QR-аар оюутны бүртгэл хийх ба хүснэгт дээр хөдөлгөөний эффектор
          нэмсэн.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-lg transition hover:-translate-y-1 hover:shadow-2xl duration-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <UserPlus className="mr-2" /> Шинэ оюутан нэмэх
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Нэр"
              value={formData.name}
              onChange={handleInputChange}
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              name="studentId"
              placeholder="Оюутны код"
              value={formData.studentId}
              onChange={handleInputChange}
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Э-майл"
              value={formData.email}
              onChange={handleInputChange}
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Утас"
              value={formData.phone}
              onChange={handleInputChange}
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition duration-200 md:col-span-2"
            >
              Хадгалах
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg transition hover:-translate-y-1 hover:shadow-2xl duration-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <QrCode className="mr-2" /> QR кодын урьдчилсан харуулах
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Формын өгөгдлөөр QR код үүсгэн харуулна. Энэ QR-ийг утаснаас
              уншуулж автоматаар бүртгэж болно.
            </p>
            {qrPreview ? (
              <img
                src={qrPreview}
                alt="Form QR Preview"
                className="mx-auto rounded-xl border border-gray-200"
              />
            ) : (
              <div className="h-56 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded-xl">
                QR үүсгэх боломжгүй байна.
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-lg transition hover:-translate-y-1 hover:shadow-2xl duration-200">
            <h2 className="text-xl font-semibold mb-4">QR-аар унших</h2>
            <div className="space-y-3">
              <button
                onClick={scanning ? stopScan : startScan}
                className="w-full bg-slate-800 text-white p-3 rounded-2xl hover:bg-slate-900 transition duration-200"
              >
                {scanning ? "Скан зогсоох" : "QR камерыг ажиллуулах"}
              </button>

              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover bg-black"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <form onSubmit={handleManualQrSubmit} className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  QR кодын текст / JSON
                </label>
                <input
                  type="text"
                  value={manualQrText}
                  onChange={(e) => setManualQrText(e.target.value)}
                  placeholder='Жишээ: {"name":"Nyamaa","studentId":"22D001","email":"n@example.com","phone":"99112233"}'
                  className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition duration-200"
                >
                  QR текстээр бүртгэх
                </button>
              </form>
              {scanMessage && (
                <p className="mt-3 text-sm text-gray-700">{scanMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">Оюутнуудын жагсаалт</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Нэр
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Код
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Э-майл
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Утас
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Үйлдэл
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Оюутан бүртгэгдээгүй байна
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="transition hover:bg-indigo-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => deleteStudent(student.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
