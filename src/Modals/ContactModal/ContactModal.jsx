import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import styles from "./styles.module.scss";

const socialMedia = [
  { name: "Twitter",  url: "https://x.com/WilliamRChiu",            icon: "/icons/x.svg"       },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/williamrchiu/", icon: "/icons/linkedin.svg" },
  { name: "GitHub",   url: "https://github.com/WilliamRChiu",       icon: "/icons/github.svg"   },
];

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export default function ContactModal() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("idle");

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, formData, PUBLIC_KEY);
      setStatus("ok");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Name:
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Subject:
          <input
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Message:
          <textarea
            name="message"
            rows="3"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </label>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Send Message"}
        </button>

        {status === "ok" && (
          <p className={styles.success}>Thanks! Your message is on its way. 😊</p>
        )}
        {status === "error" && (
          <p className={styles.error}>
            Something went wrong—please try again later.
          </p>
        )}
      </form>

      <div className={styles.socialMedia}>
        <h3>Connect with me</h3>
        <div className={styles.icons}>
          {socialMedia.map(({ name, url, icon }) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer">
              <img src={icon} alt={`${name} icon`} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
