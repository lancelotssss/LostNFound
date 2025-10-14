import { useState, useEffect } from "react";
import "../Pages/styles/landing.css";
import { useNavigate } from "react-router-dom";

import bgWave from "../assets/bbg.png";
import heroImg from "../assets/cpp.png";
import signUpIcon from "../assets/1.png";
import reportIcon from "../assets/2.png";
import matchIcon from "../assets/3.png";
import connectIcon from "../assets/4.png";
import logo from "../assets/blue.png";


import carouselImg1 from "../assets/car1.jpg";
import carouselImg2 from "../assets/car2.jpg";
import carouselImg3 from "../assets/car3.jpg";
import carouselImg4 from "../assets/car4.jpg";
import carouselImg5 from "../assets/car5.jpg";
import carouselImg6 from "../assets/car6.jpg";

import teamPhoto1 from "../assets/erick_new.jpg"; 
import teamPhoto2 from "../assets/lance_new.jpg";
import teamPhoto3 from "../assets/jacob_new.jpg";
import teamPhoto4 from "../assets/zhai_new.jpg";

import visionIcon from "../assets/Vision.png";
import missionIcon from "../assets/Mission.png";



function Landing() {
 
  const carouselImages = [
    carouselImg1,
    carouselImg2,
    carouselImg3,
    carouselImg4,
    carouselImg5,
    carouselImg6,
    
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); 

    return () => clearInterval(interval); 
  }, [carouselImages.length]);

  
  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  const handleGetStarted = () => {
    navigate("/login"); 
  };


 
  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <div className="landing">
    
      <header className="navbar">
        <div className="logo">
          <img src={logo} alt="FoundHub Logo" className="logo-img" />
        </div>
        <nav>
          <ul>
            <li><a href="#register">SIGN UP</a></li>
            <li><a href="#login">LOGIN</a></li>
          </ul>
        </nav>
      </header>

   
      <section
        className="hero"
        style={{ backgroundImage: `url(${bgWave})` }}
        id="home"
      >
        <div className="hero-content">
          <h1>
            REDISCOVER WHAT'S LOST<br />
            CONNECTING EVERY STORY,<br />
            EVERY ITEM, IN ONE PLACE.
          </h1>
          <p>A helpful solution for you and your community.</p>
          <button className="get-started" onClick={handleGetStarted}>GET STARTED</button>
        </div>
        <div className="hero-image">
          <img src={heroImg} alt="Hero Visual" />
        </div>
      </section>

     
      <section className="how-it-works">
        <h2>HOW IT WORKS</h2>
        <div className="cards">
          <div className="card">
            <img src={signUpIcon} alt="Sign Up Icon" />
            <h3>SIGN UP | LOG IN</h3>
            <p>
              Log in or create your FoundHub account to post lost items, mark found ones, and process claims.
            </p>
          </div>
          <div className="card">
            <img src={reportIcon} alt="Report Icon" />
            <h3>REPORT LOST OR FOUND</h3>
            <p>
              Add item details, description, and upload a photo.
            </p>
          </div>
          <div className="card">
            <img src={matchIcon} alt="Item Match Icon" />
            <h3>ITEM MATCH</h3>
            <p>
              FoundHub automatically checks for possible matches.
            </p>
          </div>
          <div className="card">
            <img src={connectIcon} alt="Connect Icon" />
            <h3>CONNECT & CLAIM</h3>
            <p>
              Submit a claim with details and a photo. After admin approval, connect and retrieve your item.
            </p>
          </div>
        </div>
      </section>

      
      <section className="about-foundhub" id="about">
        <h2>ABOUT FOUNDHUB</h2>
        
        <div className="carousel-section">
          <h3>MOMENTS</h3>
          
          
          <div className="carousel-container">
            <button className="carousel-btn prev" onClick={goToPrevious}>
              ❮
            </button>
            
            <div className="carousel-image-wrapper">
              <img 
                src={carouselImages[currentImageIndex]} 
                alt={`Carousel ${currentImageIndex + 1}`}
                className="carousel-image"
              />
            </div>
            
            <button className="carousel-btn next" onClick={goToNext}>
              ❯
            </button>
          </div>

          
          <div className="carousel-dots">
            {carouselImages.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>

          
          <div className="about-description">
            <p>
              FoundHub is a digital platform that helps people reconnect with their lost belongings. 
              We aim to make returning lost items easier, faster, and more reliable by connecting 
              finders and owners in one trusted space.
            </p>
          </div>
        </div>
      </section>

     
<section className="vision-mission-split">
  <div className="vm-split-section vision">
    <div className="vm-split-icon">
      <img src={visionIcon} alt="Vision Icon" />
    </div>
    <h3>OUR VISION</h3>
    <p>
      This platform is the social safety net for personal items. We restore peace of mind and sentimental value with every return. Loss carries no lasting emotional cost; it simply proves the essential goodness of our community.
    </p>
  </div>

  <div className="vm-split-section mission">
    <div className="vm-split-icon">
      <img src={missionIcon} alt="Mission Icon" />
    </div>
    <h3>OUR MISSION</h3>
    <p>
      To transform the frustration of losing something into the relief of finding it again. We aim to build a space where students can easily connect, report, and recover lost items through a system powered by technology and sincerity.
    </p>
  </div>
</section>


      
<h2 className="team-heading">MEET THE TEAM</h2>

<section className="meet-team">
  <div className="team-grid">
    <div className="team-member">
      <div className="team-photo">
        <img src={teamPhoto1} alt="Erick Carlos" />
      </div>
      <h3>Erick Carlos</h3>
      <p>PROJECT MANAGER/ BACKEND</p>
    </div>

    <div className="team-member">
      <div className="team-photo">
        <img src={teamPhoto2} alt="Lance Villegas" />
      </div>
      <h3>Lance Villegas</h3>
      <p>BACKEND/ FRONTEND</p>
    </div>

    <div className="team-member">
      <div className="team-photo">
        <img src={teamPhoto3} alt="Jacob Casiple" />
      </div>
      <h3>Jacob Casiple</h3>
      <p>UI & UX/ FRONTEND</p>
    </div>

    <div className="team-member">
      <div className="team-photo">
        <img src={teamPhoto4} alt="Zhairris Surell" />
      </div>
      <h3>Zhairris Surell</h3>
      <p>UI & UX/ FRONTEND</p>
    </div>
  </div>
</section>


      
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          <div className={`faq-item ${activeFAQ === 0 ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFAQ(0)}>
              <span>Who can use FoundHub?</span>
              <span className="faq-icon">▼</span>
            </div>
            <div className="faq-answer">
              <p>
              FoundHub is designed for students, faculty, and staff of educational institutions. Whether on or off campus, anyone who has lost or found an item can use our platform to report and recover belongings.
              </p>
            </div>
          </div>

          <div className={`faq-item ${activeFAQ === 1 ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFAQ(1)}>
              <span>How do I report an item?</span>
              <span className="faq-icon">▼</span>
            </div>
            <div className="faq-answer">
              <p>
                To report an item, log in or create a FoundHub account, then click "Report Lost" or "Report Found." Fill in the item details, upload a photo, and submit your report. Our administrators will verify it. Once verified, lost items will be matched with found items that closely fit the description. For found items, please hand them over to an admin to help reunite them with their rightful owners.
              </p>
            </div>
          </div>

          <div className={`faq-item ${activeFAQ === 2 ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFAQ(2)}>
              <span>Is FoundHub free to use?</span>
              <span className="faq-icon">▼</span>
            </div>
            <div className="faq-answer">
              <p>
                Yes! FoundHub is completely free for all students and staff members. Our goal is to help reunite people with their belongings without any cost barriers.
              </p>
            </div>
          </div>

          <div className={`faq-item ${activeFAQ === 3 ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFAQ(3)}>
              <span>How long does the claim process take?</span>
              <span className="faq-icon">▼</span>
            </div>
            <div className="faq-answer">
              <p>
                After submitting a claim, our admin team will review it promptly. Once approved, you’ll be connected with an admin to coordinate receiving or returning the item.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
