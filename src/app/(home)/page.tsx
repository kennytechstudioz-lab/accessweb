'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Landmark, Shield, Globe, Award, Sparkles, HelpCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useFaqStore } from '@/store/faqStore';
import { useBlogsStore } from '@/store/blogsStore';

export default function Home() {
  const { faqs, fetchFaqs } = useFaqStore();
  const { blogs, fetchBlogs } = useBlogsStore();
  const [calculatorType, setCalculatorType] = useState<'savings' | 'loan'>('savings');
  const [calcAmount, setCalcAmount] = useState(5000);
  const [calcDuration, setCalcDuration] = useState(12); // months
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    fetchFaqs();
    fetchBlogs();
  }, [fetchFaqs, fetchBlogs]);



  const calculateResult = () => {
    if (calculatorType === 'savings') {
      // 4.5% annual interest
      const monthlyRate = 0.045 / 12;
      let total = calcAmount;
      for (let i = 0; i < calcDuration; i++) {
        total += total * monthlyRate;
      }
      return {
        label: 'Projected Balance',
        value: total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        earned: (total - calcAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      };
    } else {
      // 6.5% interest rate
      const annualRate = 0.065;
      const monthlyRate = annualRate / 12;
      const numPayments = calcDuration;
      const monthlyPayment = (calcAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                             (Math.pow(1 + monthlyRate, numPayments) - 1);
      const totalPay = monthlyPayment * numPayments;
      return {
        label: 'Monthly Payment',
        value: monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        earned: (totalPay - calcAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), // total interest
      };
    }
  };

  const calcResult = calculateResult();

  const slides = [
    {
      image: '/images/banner-1.jpg',
      title: (
        <>
          Open our <span className="text-primary">Current</span><br />Account Online
        </>
      ),
      subtitle: 'This statistic is based on our average personal current account online opening time from the last 12 months.',
      buttonText: 'Make an Appointment',
      buttonLink: '/register',
    },
    {
      image: '/images/banner-2.jpg',
      title: (
        <>
          Connecting All Your<br /><span className="text-primary">Banking</span> Needs
        </>
      ),
      subtitle: 'Experience seamless digital banking with premium security and multi-currency support.',
      buttonText: 'Open Account',
      buttonLink: '/register',
    },
    {
      image: '/images/banner-3.jpg',
      title: (
        <>
          Experience the Joy of<br />Financial <span className="text-primary">Safety</span>
        </>
      ),
      subtitle: 'Enjoy peace of mind with our state-of-the-art secure vaults and clearing systems.',
      buttonText: 'Learn More',
      buttonLink: '/about',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative">
      
      {/* 1. Hero Section (Slider/Carousel) */}
      <section id="top" className="relative h-[500px] sm:h-[650px] md:h-[750px] w-full bg-slate-950 overflow-hidden">
        
        {/* Slides */}
        {slides.map((slide, index) => {
          const isActive = currentSlide === index;
          return (
            <div
              key={index}
              className={`absolute inset-0 flex items-center transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 invisible'
              }`}
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Dark Overlay for text readability */}
              <div className="absolute inset-0 bg-black/60" />
              
              {/* Slide Content with sequential entrance animations */}
              <div className="max-w-[1380px] mx-auto px-[10px] sm:px-8 md:px-12 w-full relative z-20 text-white flex flex-col gap-5 sm:gap-6 font-sans">
                <h1
                  className={`text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight transition-all duration-1000 transform ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                >
                  {slide.title}
                </h1>
                
                <p
                  className={`text-slate-305 text-xs sm:text-sm md:text-base max-w-lg font-light leading-relaxed transition-all duration-1000 delay-300 transform ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                >
                  {slide.subtitle}
                </p>

                <div
                  className={`flex mt-2 transition-all duration-1000 delay-500 transform ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                >
                  <Link
                    href={slide.buttonLink}
                    className="bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-6 sm:px-8 py-3.5 sm:py-4 transition-all duration-300 shadow-lg shadow-red-950/20 rounded-none cursor-pointer"
                  >
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Right Floating Asset: Wavy line */}
        <img
          src="/images/wave.png"
          alt=""
          className="absolute right-0 top-0 bottom-0 h-full w-auto opacity-95 z-20 pointer-events-none select-none"
        />

        {/* Slide Indicators (Dots) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'bg-primary w-6' : 'bg-white/40 hover:bg-white/65'
              }`}
            />
          ))}
        </div>

      </section>

      {/* 2. Overlapping Features Grid Section */}
      <section className="relative z-30 bg-transparent">
        <div className="max-w-[1380px] mx-auto px-[10px] sm:px-8 md:px-12">
          {/* Grid Card itself overlapping hero */}
          <div className="bg-white rounded-sm border border-slate-200/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 overflow-hidden relative z-40 -mt-20 sm:-mt-24 md:-mt-28 shadow-sm">
          
          {/* Card 1 */}
          <div className="flex flex-col gap-5 p-8 sm:p-10 md:p-12 border-b lg:border-b-0 lg:border-r last:border-b-0 lg:last:border-r-0 border-slate-100/80 hover:bg-primary group transition-all duration-300">
            <div className="w-18 h-18 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all duration-300">
              <svg className="w-8 h-8 text-white group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg md:text-xl leading-snug group-hover:text-white transition-colors duration-300">
              Secure International Transaction
            </h3>
            <p className="text-slate-500 text-sm font-light leading-relaxed group-hover:text-white/80 transition-colors duration-300">
              End-to-end encrypted wire transfers with real-time tracking and instant multi-currency clearance.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col gap-5 p-8 sm:p-10 md:p-12 border-b lg:border-b-0 lg:border-r last:border-b-0 lg:last:border-r-0 border-slate-100/80 hover:bg-primary group transition-all duration-300">
            <div className="w-18 h-18 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all duration-300">
              <svg className="w-8 h-8 text-white group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg md:text-xl leading-snug group-hover:text-white transition-colors duration-300">
              24/7 Support from the Expert Team
            </h3>
            <p className="text-slate-500 text-sm font-light leading-relaxed group-hover:text-white/80 transition-colors duration-300">
              Dedicated relationship managers and round-the-clock technical assistance available anytime, anywhere.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col gap-5 p-8 sm:p-10 md:p-12 border-b lg:border-b-0 lg:border-r last:border-b-0 lg:last:border-r-0 border-slate-100/80 hover:bg-primary group transition-all duration-300">
            <div className="w-18 h-18 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all duration-300">
              <svg className="w-8 h-8 text-white group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg md:text-xl leading-snug group-hover:text-white transition-colors duration-300">
              Lowest Processing Fee than Other Banks
            </h3>
            <p className="text-slate-500 text-sm font-light leading-relaxed group-hover:text-white/80 transition-colors duration-300">
              Enjoy zero maintenance fees and institutional exchange rates with zero hidden charges.
            </p>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col gap-5 p-8 sm:p-10 md:p-12 border-b lg:border-b-0 lg:border-r last:border-b-0 lg:last:border-r-0 border-slate-100/80 hover:bg-primary group transition-all duration-300">
            <div className="w-18 h-18 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all duration-300">
              <svg className="w-8 h-8 text-white group-hover:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg md:text-xl leading-snug group-hover:text-white transition-colors duration-300">
              Less Time in any Loans Approval
            </h3>
            <p className="text-slate-500 text-sm font-light leading-relaxed group-hover:text-white/80 transition-colors duration-300">
              Automated credit scoring and rapid decision-making engines for fast commercial loan access.
            </p>
          </div>

          </div>
        </div>
      </section>



      {/* 3. About Us Detail Section */}
      <section id="about" className="py-24 px-[10px] sm:px-8 relative overflow-hidden bg-white">
        
        {/* Main Grid Wrapper */}
        <div className="max-w-[1380px] mx-auto px-[10px] sm:px-8 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          
          {/* Left Side: Graphic Banner and Overlapping Badges */}
          <div className="relative w-full max-w-[540px] mx-auto lg:mx-0">
            
            {/* Background Dotted Grid */}
            <img
              src="/images/grid.png"
              alt=""
              className="absolute -left-10 top-1/2 -translate-y-1/2 w-28 opacity-45 select-none pointer-events-none -z-10"
            />
            
            {/* Main Picture */}
            <img
              src="/images/about-1.jpg"
              alt="Financial Meeting"
              className="w-full object-cover rounded-sm border border-slate-100 shadow-md relative z-10"
            />

            {/* Top-Left Rating Badge */}
            <div className="absolute top-0 -left-6 bg-white shadow-xl px-6 py-5 rounded-sm border border-slate-100/40 z-20 flex flex-col gap-2 items-center justify-center min-w-[200px]">
              <div className="flex gap-1 text-amber-500 text-lg leading-none">
                ★ ★ ★ ★ ★
              </div>
              <span className="font-extrabold text-slate-800 text-sm tracking-tight mt-0.5">5 Star Rating Bank</span>
            </div>

            {/* Floating Border Rectangular Container (no background, no border) */}
            <div className="absolute right-0 bottom-12 translate-x-1/2 w-[350px] h-[325px] z-20 flex items-center justify-center">
              
              {/* Semicircle Outline (centered in the container, taking 50% width and full height on the left) */}
              <img
                src="/images/semicircle.png"
                alt=""
                className="absolute left-0 top-0 h-full w-1/2 object-contain opacity-90 select-none pointer-events-none z-10"
              />

              {/* Centered Red Circular Badge */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-44 h-44 bg-primary text-white rounded-full flex flex-col items-center justify-center text-center shadow-lg pointer-events-auto">
                  <span className="text-6xl font-black tracking-tight leading-none">40</span>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest leading-normal mt-2">
                    Years of<br />Experience
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Side: Text & Service Points */}
          <div className="flex flex-col gap-6">
            <span className="text-primary font-extrabold text-sm sm:text-base tracking-widest uppercase block mb-1">
              ABOUT US
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight">
              Financial Guidance for Every Stage of Life.
            </h2>
            <p className="text-slate-500 text-base sm:text-lg md:text-xl font-light leading-relaxed mb-4">
              At Access National Bank, we combine cutting-edge security with tailored financial solutions. From multi-currency checking accounts to high-yield savings and international wire clearance, we empower individuals and corporate clients globally.
            </p>

            {/* Bullet list with icons */}
            <div className="flex flex-col gap-8">
              
              {/* Item 1 */}
              <div className="flex gap-6 items-center">
                {/* Outer pink circle */}
                <div className="w-18 h-18 bg-red-50 text-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 hover:scale-105">
                  {/* Inner bordered circle */}
                  <div className="w-12 h-12 border border-primary rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold font-mono select-none">$</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-extrabold text-slate-900 text-xl sm:text-2xl">Solution Focused</h4>
                  <p className="text-slate-500 text-sm sm:text-base font-light leading-relaxed">
                    Customized wealth plans, multi-currency debit cards, and 24/7 dedicated account managers tailored to your financial goals.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex gap-6 items-center">
                {/* Outer pink circle */}
                <div className="w-18 h-18 bg-red-50 text-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 hover:scale-105">
                  {/* Inner bordered circle */}
                  <div className="w-12 h-12 border border-primary rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-extrabold text-slate-900 text-xl sm:text-2xl">99.99% Success</h4>
                  <p className="text-slate-500 text-sm sm:text-base font-light leading-relaxed">
                    High-availability cloud architecture guaranteeing zero-downtime wire clearance and real-time transaction processing.
                  </p>
                </div>
              </div>


            </div>

            {/* Discover More Action Button */}
            <div className="mt-6">
              <Link
                href="/about"
                className="bg-primary hover:bg-primary-hover text-white text-sm sm:text-base font-bold uppercase tracking-wider px-10 py-4.5 transition-all duration-300 rounded-none shadow-lg shadow-red-950/10 inline-block cursor-pointer"
              >
                Discover More
              </Link>
            </div>

          </div>

        </div>

        {/* Go To Top Floating Element on the right border */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 z-10 pointer-events-none">
          <div className="w-48 h-48 border border-slate-100 rounded-full absolute -right-24 top-1/2 -translate-y-1/2" />
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="pointer-events-auto flex flex-col items-center gap-2 text-primary hover:text-primary-hover transition-colors focus:outline-none cursor-pointer pr-4"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest [writing-mode:vertical-lr] mb-1">
              Go To Top
            </span>
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          </button>
        </div>

      </section>

      {/* 4. Our Services Section */}
      <section className="bg-slate-50 py-24 px-[10px] sm:px-8 border-t border-slate-100 relative overflow-hidden">
        
        {/* Main Wrapper */}
        <div className="max-w-[1380px] mx-auto px-[10px] sm:px-8 md:px-12 relative z-10">
          
          {/* Section Header */}
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="text-primary font-extrabold text-sm sm:text-base tracking-widest uppercase block">
              OUR SERVICES
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
              Online Banking at Your Fingertips
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white border border-slate-100 p-8 rounded-sm shadow-sm hover:bg-primary group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col gap-4">
              <img
                src="/images/semicircle.png"
                alt=""
                className="absolute -right-6 -bottom-6 w-16 h-16 opacity-30 select-none pointer-events-none z-0 group-hover:opacity-10 transition-opacity duration-300"
              />
              <div className="text-primary group-hover:text-white relative z-10 transition-colors duration-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v7H3zm4-5h2v12H7zm4 4h2v8h-2zm4-9h2v17h-2zm4 5h2v12h-2zM12 3a3 3 0 100 6 3 3 0 000-6z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 group-hover:text-white text-lg sm:text-xl relative z-10 transition-colors duration-300">
                Digital Banking
              </h3>
              <ul className="list-disc pl-4 text-slate-500 group-hover:text-white/80 text-sm font-light space-y-2 relative z-10 transition-colors duration-300">
                <li>Bank & savings accounts</li>
                <li>Credit cards</li>
                <li>Personal loans</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-100 p-8 rounded-sm shadow-sm hover:bg-primary group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col gap-4">
              <img
                src="/images/semicircle.png"
                alt=""
                className="absolute -right-6 -bottom-6 w-16 h-16 opacity-30 select-none pointer-events-none z-0 group-hover:opacity-10 transition-opacity duration-300"
              />
              <div className="text-primary group-hover:text-white relative z-10 transition-colors duration-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2zM12 7v4m0 0H9m3 0h3" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 group-hover:text-white text-lg sm:text-xl relative z-10 transition-colors duration-300">
                Mobile & Web Banking
              </h3>
              <ul className="list-disc pl-4 text-slate-500 group-hover:text-white/80 text-sm font-light space-y-2 relative z-10 transition-colors duration-300">
                <li>Instant Access</li>
                <li>Savings Fixed Term</li>
                <li>Savings Instant</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-100 p-8 rounded-sm shadow-sm hover:bg-primary group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col gap-4">
              <img
                src="/images/semicircle.png"
                alt=""
                className="absolute -right-6 -bottom-6 w-16 h-16 opacity-30 select-none pointer-events-none z-0 group-hover:opacity-10 transition-opacity duration-300"
              />
              <div className="text-primary group-hover:text-white relative z-10 transition-colors duration-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 group-hover:text-white text-lg sm:text-xl relative z-10 transition-colors duration-300">
                Insurance Policies
              </h3>
              <ul className="list-disc pl-4 text-slate-500 group-hover:text-white/80 text-sm font-light space-y-2 relative z-10 transition-colors duration-300">
                <li>Pet insurance</li>
                <li>Transport Insurance</li>
                <li>Accident insurance</li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-100 p-8 rounded-sm shadow-sm hover:bg-primary group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col gap-4">
              <img
                src="/images/semicircle.png"
                alt=""
                className="absolute -right-6 -bottom-6 w-16 h-16 opacity-30 select-none pointer-events-none z-0 group-hover:opacity-10 transition-opacity duration-300"
              />
              <div className="text-primary group-hover:text-white relative z-10 transition-colors duration-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 group-hover:text-white text-lg sm:text-xl relative z-10 transition-colors duration-300">
                Home & Property Loan
              </h3>
              <ul className="list-disc pl-4 text-slate-500 group-hover:text-white/80 text-sm font-light space-y-2 relative z-10 transition-colors duration-300">
                <li>Residential Mortgages</li>
                <li>Buy-to-let Mortgages</li>
                <li>Building Mortgages</li>
              </ul>
            </div>

            {/* Card 5 */}
            <div className="bg-white border border-slate-100 p-8 rounded-sm shadow-sm hover:bg-primary group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col gap-4">
              <img
                src="/images/semicircle.png"
                alt=""
                className="absolute -right-6 -bottom-6 w-16 h-16 opacity-30 select-none pointer-events-none z-0 group-hover:opacity-10 transition-opacity duration-300"
              />
              <div className="text-primary group-hover:text-white relative z-10 transition-colors duration-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a7 7 0 00-14 0v2m14 0h-14" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 group-hover:text-white text-lg sm:text-xl relative z-10 transition-colors duration-300">
                All Bank Account
              </h3>
              <ul className="list-disc pl-4 text-slate-500 group-hover:text-white/80 text-sm font-light space-y-2 relative z-10 transition-colors duration-300">
                <li>nstant Access Savings</li>
                <li>Instant Access Cash</li>
                <li>Young Savers Account</li>
              </ul>
            </div>

            {/* Card 6 */}
            <div className="bg-white border border-slate-100 p-8 rounded-sm shadow-sm hover:bg-primary group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col gap-4">
              <img
                src="/images/semicircle.png"
                alt=""
                className="absolute -right-6 -bottom-6 w-16 h-16 opacity-30 select-none pointer-events-none z-0 group-hover:opacity-10 transition-opacity duration-300"
              />
              <div className="text-primary group-hover:text-white relative z-10 transition-colors duration-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055zM20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 group-hover:text-white text-lg sm:text-xl relative z-10 transition-colors duration-300">
                Borrowing Accounts
              </h3>
              <ul className="list-disc pl-4 text-slate-500 group-hover:text-white/80 text-sm font-light space-y-2 relative z-10 transition-colors duration-300">
                <li>Bank Credit Card</li>
                <li>Setter personal loan</li>
                <li>Overdraft</li>
              </ul>
            </div>

            {/* Card 7 */}
            <div className="bg-white border border-slate-100 p-8 rounded-sm shadow-sm hover:bg-primary group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col gap-4">
              <img
                src="/images/semicircle.png"
                alt=""
                className="absolute -right-6 -bottom-6 w-16 h-16 opacity-30 select-none pointer-events-none z-0 group-hover:opacity-10 transition-opacity duration-300"
              />
              <div className="text-primary group-hover:text-white relative z-10 transition-colors duration-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 group-hover:text-white text-lg sm:text-xl relative z-10 transition-colors duration-300">
                Private Banking
              </h3>
              <ul className="list-disc pl-4 text-slate-500 group-hover:text-white/80 text-sm font-light space-y-2 relative z-10 transition-colors duration-300">
                <li>Dedicated personal service</li>
                <li>Specialist teams</li>
                <li>Tailored products</li>
              </ul>
            </div>

            {/* Card 8 */}
            <div className="bg-white border border-slate-100 p-8 rounded-sm shadow-sm hover:bg-primary group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col gap-4">
              <img
                src="/images/semicircle.png"
                alt=""
                className="absolute -right-6 -bottom-6 w-16 h-16 opacity-30 select-none pointer-events-none z-0 group-hover:opacity-10 transition-opacity duration-300"
              />
              <div className="text-primary group-hover:text-white relative z-10 transition-colors duration-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-900 group-hover:text-white text-lg sm:text-xl relative z-10 transition-colors duration-300">
                Fixed Term Accounts
              </h3>
              <ul className="list-disc pl-4 text-slate-500 group-hover:text-white/80 text-sm font-light space-y-2 relative z-10 transition-colors duration-300">
                <li>Fixed Term Saving</li>
                <li>Fixed Rate Cash</li>
                <li>Resume your Current</li>
              </ul>
            </div>

          </div>

        </div>

        {/* Go To Top Floating Element on the right border */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 z-10 pointer-events-none">
          <div className="w-48 h-48 border border-slate-100 rounded-full absolute -right-24 top-1/2 -translate-y-1/2" />
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="pointer-events-auto flex flex-col items-center gap-2 text-primary hover:text-primary-hover transition-colors focus:outline-none cursor-pointer pr-4"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest [writing-mode:vertical-lr] mb-1">
              Go To Top
            </span>
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          </button>
        </div>

      </section>

      {/* 5. Video Play Presentation Section */}
      <section
        className="relative py-32 px-[10px] sm:px-8 bg-cover bg-center flex items-center justify-center min-h-[500px] overflow-hidden"
        style={{
          backgroundImage: "url('/images/video-bg.jpg')",
        }}
      >
        {/* Darkened Overlay */}
        <div className="absolute inset-0 bg-slate-950/70 z-0" />

        {/* Contents */}
        <div className="max-w-[1380px] mx-auto px-[10px] sm:px-8 md:px-12 w-full text-center relative z-10 flex flex-col items-center gap-4">
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white max-w-2xl leading-tight">
            The 3rd Generation Private Commercial Bank
          </h2>

          {/* Animated concentric ripple play button */}
          <div className="relative flex items-center justify-center mt-6 mb-4">
            <div className="absolute w-24 h-24 border border-white/20 rounded-full animate-ping" />
            <div className="absolute w-20 h-20 border border-white/25 rounded-full" />
            <div className="absolute w-16 h-16 border border-white/30 rounded-full" />
            
            <button className="relative w-16 h-16 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-colors duration-300 z-10 pl-1 focus:outline-none">
              <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

        </div>

      </section>

      {/* 6. Overlapping Statistics Row */}
      <section className="relative z-30 px-[10px] sm:px-8 md:px-12 max-w-[1380px] mx-auto -mt-16 sm:-mt-20 mb-24">
        <div className="bg-white shadow-2xl rounded-sm overflow-hidden grid grid-cols-1 md:grid-cols-3">
          
          {/* Stats 1 */}
          <div className="bg-white p-8 sm:p-10 flex items-center gap-6 text-slate-900 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="w-16 h-16 bg-red-50 text-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20c-2.202 0-4.275-.626-6.029-1.706L3.75 18.06M10.089 20v-.111c0-1.113.285-2.16.786-3.07M10.089 20c-1.25 0-2.455-.277-3.535-.774m0 0a11.39 11.39 0 01-1.026-.523m0 0L3.3 18v-3.075m0 0l.45.247M3.75 14.125A5.982 5.982 0 0110 8.25c1.666 0 3.208.68 4.33 1.775M3.75 14.125c-.966 0-1.892-.228-2.713-.637M12 6a3 3 0 11-6 0 3 3 0 016 0zm7.72 5.57a3 3 0 11-5.715-1.865 3 3 0 015.715 1.865z" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">50k+</span>
              <span className="text-slate-500 text-sm font-semibold">Happy Clients</span>
            </div>
          </div>

          {/* Stats 2 */}
          <div className="bg-[#0B1220] p-8 sm:p-10 flex items-center gap-6 text-white border-b md:border-b-0 md:border-r border-slate-800/40">
            <div className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h.007m-.007 3h.007m-.007 3h.007m-3.75.75h.007m-.007 3h.007m-.007 3h.007m3.75 3h.007M9 3h.008M15 3h.008M21 3h.008M12 9a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">90Bn</span>
              <span className="text-slate-400 text-sm font-semibold">Total Transactions</span>
            </div>
          </div>

          {/* Stats 3 */}
          <div className="bg-primary p-8 sm:p-10 flex items-center gap-6 text-white">
            <div className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.339M4.5 21V10.339" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">40+</span>
              <span className="text-white/80 text-sm font-semibold">Branches in USA</span>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Mobile App Section */}
      <section className="py-24 px-[10px] sm:px-8 bg-white relative overflow-hidden">
        <div className="max-w-[1380px] mx-auto px-[10px] sm:px-8 md:px-12 relative z-10">
          
          {/* Main Layout Card with Grid Left Block and Gray Right Block */}
          <div className="relative rounded-sm overflow-hidden min-h-[800px] grid grid-cols-1 lg:grid-cols-12 bg-[#F8F9FA] border border-slate-100/80 shadow-sm">
            
            {/* Left: Rectangular Div with full height hosting grid.png (no padding, touching edges) */}
            <div className="lg:col-span-4 relative min-h-[550px] lg:min-h-full overflow-hidden">
              <img 
                src="/images/grid.png" 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" 
              />
            </div>

            {/* Right: Text Content (col-span-8) */}
            <div className="lg:col-span-8 p-8 sm:p-12 md:p-16 flex flex-col justify-center lg:pl-32">
              
              <span className="text-primary font-extrabold text-sm sm:text-base tracking-widest uppercase block mb-2">
                MOBILE APP
              </span>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6 max-w-xl">
                Get the Fastest and Most Secure Banking
              </h2>
              
              <p className="text-slate-500 text-base sm:text-lg font-light leading-relaxed mb-8 max-w-xl">
                Manage your multi-currency accounts, transfer funds globally, authorize wire clearances, and generate virtual debit cards directly from your smartphone with end-to-end encryption.
              </p>


              {/* App store download badges */}
              <div className="flex flex-wrap gap-4 relative z-10">
                {/* Google Play */}
                <a href="#" className="hover:opacity-90 transition-opacity">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-12 w-auto" />
                </a>
                {/* App Store */}
                <a href="#" className="hover:opacity-90 transition-opacity">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-12 w-auto" />
                </a>
              </div>

            </div>

            {/* Floating Rectangular Div (half in red block/image bg, half outside in grey container) */}
            <div className="absolute left-1/2 lg:left-[27%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-[280px] sm:w-[350px] h-[380px] sm:h-[630px] bg-slate-200 border border-slate-300 shadow-xl z-30 flex flex-col items-center justify-center rounded-sm text-slate-400 select-none">
              <svg className="w-16 h-16 mb-3 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
              <span className="font-extrabold text-sm uppercase tracking-wider text-slate-500">Mobile Phones</span>
              <span className="text-[11px] text-slate-400 mt-1">Placeholder Container</span>
            </div>

          </div>

        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="py-28 px-[10px] sm:px-8 border-t border-slate-100 relative overflow-hidden bg-white">
        
        {/* Testimonials Background Image with Opacity */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.06] pointer-events-none select-none z-0"
          style={{
            backgroundImage: "url('/images/testimonial-bg.jpg')",
          }}
        />

        {/* Main Wrapper */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 md:px-12 relative z-10">
          
          {/* Section Header */}
          <div className="text-center flex flex-col items-center gap-3 mb-24">
            <span className="text-primary font-extrabold text-sm sm:text-base tracking-widest uppercase block">
              TESTIMONIALS
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
              Love from Our Clients
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            
            {/* Card 1 */}
            <div className="bg-white border border-slate-100/80 p-8 pt-16 rounded-sm shadow-sm relative flex flex-col items-center hover:shadow-md transition-shadow duration-300">
              {/* Avatar Container overlapping top edge */}
              <div className="w-20 h-20 rounded-full border-4 border-white absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" 
                  alt="Sandra Bullock" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Sandra Bullock</h3>
              <span className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-0.5">Manager</span>
              <div className="flex gap-1 text-amber-500 text-sm mt-3 mb-4">
                ★ ★ ★ ★ ★
              </div>
              <p className="text-slate-500 text-sm font-light leading-relaxed italic text-center">
                &ldquo;Access National Bank transformed how our international team handles cross-border payroll. Wire transfers clear in minutes and multi-currency accounts save us thousands on conversion fees.&rdquo;
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-100/80 p-8 pt-16 rounded-sm shadow-sm relative flex flex-col items-center hover:shadow-md transition-shadow duration-300">
              {/* Avatar Container overlapping top edge */}
              <div className="w-20 h-20 rounded-full border-4 border-white absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" 
                  alt="Julien Anthor" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Julien Anthor</h3>
              <span className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-0.5">Manager</span>
              <div className="flex gap-1 text-amber-500 text-sm mt-3 mb-4">
                ★ ★ ★ ★ ★
              </div>
              <p className="text-slate-500 text-sm font-light leading-relaxed italic text-center">
                &ldquo;The digital banking interface is unmatched. Managing USD, EUR, and GBP balances in a single unified dashboard with instant TAC code verification has been a game-changer.&rdquo;
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-100/80 p-8 pt-16 rounded-sm shadow-sm relative flex flex-col items-center hover:shadow-md transition-shadow duration-300">
              {/* Avatar Container overlapping top edge */}
              <div className="w-20 h-20 rounded-full border-4 border-white absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" 
                  alt="Rolier Demonil" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Rolier Demonil</h3>
              <span className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-0.5">Manager</span>
              <div className="flex gap-1 text-amber-500 text-sm mt-3 mb-4">
                ★ ★ ★ ★ ★
              </div>
              <p className="text-slate-500 text-sm font-light leading-relaxed italic text-center">
                &ldquo;Outstanding security standards and round-the-clock customer support. Knowing our corporate funds are backed by 99.99% cloud uptime gives our investor group total confidence.&rdquo;
              </p>
            </div>


          </div>

        </div>

        {/* Go To Top Floating Element on the right border */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 z-10 pointer-events-none">
          <div className="w-48 h-48 border border-slate-100 rounded-full absolute -right-24 top-1/2 -translate-y-1/2" />
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="pointer-events-auto flex flex-col items-center gap-2 text-primary hover:text-primary-hover transition-colors focus:outline-none cursor-pointer pr-4"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest [writing-mode:vertical-lr] mb-1">
              Go To Top
            </span>
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          </button>
        </div>

      </section>

      {/* 9. Latest News Section */}
      <section id="blog" className="bg-white py-28 px-4 sm:px-8 border-t border-slate-100 relative overflow-hidden">
        
        {/* Faint Decorative Overlays */}
        <img 
          src="/images/wave.png" 
          className="absolute -left-24 top-1/2 -translate-y-1/2 w-56 h-auto opacity-[0.03] pointer-events-none select-none z-0" 
          alt="" 
        />
        <img 
          src="/images/semicircle.png" 
          className="absolute -right-28 top-12 w-64 h-auto opacity-[0.03] pointer-events-none select-none z-0" 
          alt="" 
        />

        {/* Main Wrapper */}
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 md:px-12 relative z-10">
          
          {/* Section Header */}
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="text-primary font-extrabold text-sm sm:text-base tracking-widest uppercase block">
              LATEST NEWS
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
              Our Latest Media Update
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs
              .filter((b) => !b.category || b.category.toLowerCase() === 'blog')
              .slice(0, 3)
              .map((blog) => {
                const dateStr = new Date(blog.time * 1000).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const bannerBg = blog.banner || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&h=800&q=80';

                return (
                  <div key={blog._id} className="relative rounded-sm overflow-hidden h-[480px] group shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-end p-8 border border-slate-100/50">
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url('${bannerBg}')`
                      }}
                    />
                    {/* Dark overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300 z-0" />

                    {/* Contents */}
                    <div className="relative z-10 flex flex-col items-start w-full">
                      {/* Date badge */}
                      <div className="bg-white text-slate-800 text-xs px-4 py-1.5 rounded-full flex items-center gap-2 font-semibold shadow-sm mb-4 select-none">
                        <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {dateStr}
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-white text-lg sm:text-xl leading-snug group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-3 cursor-pointer">
                        <Link href={`/blog/${blog._id}`}>
                          {blog.title}
                        </Link>
                      </h3>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-white/80 text-xs mb-6 font-medium">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          {blog.author || 'Admin'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-primary/80 text-white text-[10px] uppercase px-2 py-0.5 rounded font-bold">
                            {blog.category || 'Blog'}
                          </span>
                        </div>
                      </div>

                      {/* Read More Button */}
                      <Link 
                        href={`/blog/${blog._id}`} 
                        className="bg-white text-primary hover:bg-primary hover:text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-8 py-3.5 transition-all duration-300 rounded-none cursor-pointer shadow-md"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>


        </div>

        {/* Go To Top Floating Element on the right border */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 z-10 pointer-events-none">
          <div className="w-48 h-48 border border-slate-100 rounded-full absolute -right-24 top-1/2 -translate-y-1/2" />
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="pointer-events-auto flex flex-col items-center gap-2 text-primary hover:text-primary-hover transition-colors focus:outline-none cursor-pointer pr-4"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest [writing-mode:vertical-lr] mb-1">
              Go To Top
            </span>
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          </button>
        </div>

      </section>

      {/* 5. Simple FAQ Section */}
      <section id="faq" className="py-20 px-[10px] sm:px-8 max-w-4xl mx-auto">
        <div className="text-center flex flex-col gap-3 mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-slate-500 font-light text-sm">Everything you need to know about our international banking operations.</p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.length > 0 ? (
            faqs.map((faq: any) => (
              <div key={faq._id || faq.id || faq.question} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                {faq.category && (
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                    {faq.category}
                  </span>
                )}
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">{faq.question}</h4>
                <p className="text-slate-500 text-xs sm:text-sm font-light mt-2 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white p-5 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">What are the requirements to open an account?</h4>
                <p className="text-slate-500 text-xs sm:text-sm font-light mt-2 leading-relaxed">
                  To open an account, you only need to complete our registration process and upload a valid government ID or passport copy in the dashboard KYC section. Verification usually takes less than 24 hours.
                </p>
              </div>
              <div className="bg-white p-5 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">How does the wire transfer clearance system work?</h4>
                <p className="text-slate-500 text-xs sm:text-sm font-light mt-2 leading-relaxed">
                  When processing large international wire transfers, standard regulatory clearance is required. In some cases, the system requires Transaction Authorization Codes (TAC) or IMF Clearance codes which are emailed to you or set by your account manager.
                </p>
              </div>
            </>
          )}
        </div>
      </section>


      {/* 10. Contact Section */}
      <section id="contact" className="bg-slate-50/50 py-24 border-t border-slate-200/60 relative overflow-hidden">
        
        {/* Main Wrapper */}
        <div className="max-w-[1380px] mx-auto px-[10px] sm:px-8 md:px-12 relative z-10">
          
          <div className="relative rounded-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-white border border-slate-200/60 shadow-sm items-stretch">
            
            {/* Left Column: Form (col-span-6) */}
            <div className="lg:col-span-6 p-8 sm:p-12 md:p-16 flex flex-col justify-between">
              <div>
                <span className="text-primary font-extrabold text-xs sm:text-sm tracking-widest uppercase block mb-3">
                  GET IN TOUCH
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-8">
                  Send Us a Message
                </h2>
                
                {contactSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-6 rounded-sm flex flex-col items-center text-center gap-2">
                    <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-base">Message Sent Successfully!</span>
                    <span className="text-xs text-emerald-600 font-light">Thank you for reaching out. We will get back to you shortly.</span>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSubmitted(true);
                    }} 
                    className="flex flex-col gap-6"
                  >
                    {/* Name field */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="contact-name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input 
                        type="text" 
                        id="contact-name" 
                        placeholder="Enter your name" 
                        className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 bg-slate-50/30"
                        required
                      />
                    </div>

                    {/* Email field */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="contact-email" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        id="contact-email" 
                        placeholder="Enter your email address" 
                        className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 bg-slate-50/30"
                        required
                      />
                    </div>

                    {/* Message field */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="contact-message" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Message
                      </label>
                      <textarea 
                        id="contact-message" 
                        rows={5} 
                        placeholder="Type your message here..." 
                        className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 bg-slate-50/30 resize-none"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit"
                      className="bg-primary text-white font-extrabold uppercase tracking-wider py-4 px-8 rounded-sm hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg duration-300 mt-2 text-xs sm:text-sm self-start cursor-pointer border-none"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column: Map (col-span-6) */}
            <div className="lg:col-span-6 min-h-[450px] lg:min-h-full overflow-hidden relative z-10 bg-slate-100">
              <iframe 
                title="Office Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345093744!2d144.9537353153403!3d-37.81627977975171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4c2b34f55d%3A0x3ef247f0d6192852!2sVictoria%20State%20Library!5e0!3m2!1sen!2sua!4v1633000000000!5m2!1sen!2sua"
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: '450px', height: '100%', filter: 'grayscale(1) invert(0.08) contrast(1.1)' }} 
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
