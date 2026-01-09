import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

type PageDoneProps = {
  headline: string;
  subhead: string;
  marqueeText: string;
  heroImage: string;
};

const extraCss = `
#circle svg {
  animation: rotate 10s linear infinite;
}
@keyframes rotate {
  from { transform: rotate(360deg); }
  to { transform: rotate(0); }
}
:root {
  --gap: 4rem;
}
.marquee {
  overflow: hidden;
  user-select: none;
  display: flex;
  gap: var(--gap);
  transform: rotate(-4deg);
}
.animated-ul {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--gap);
  animation: marquee 8s linear infinite;
}
@keyframes marquee {
  to { transform: translateX(calc(-100% - var(--gap))); }
}
`;

const PageDoneSample = ({ headline, subhead, marqueeText, heroImage }: PageDoneProps) => (
  <>
    <style>{extraCss}</style>
    <div className="font-sans">
      <nav className="lg:fixed w-full bg-white transition-all duration-500 py-5 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="w-full flex flex-col lg:flex-row">
            <div className="flex justify-between lg:flex-row">
              <a href="https://pagedone.io/" className="flex items-center">
                <span className="text-lg font-semibold">Pagedone</span>
              </a>
              <button
                type="button"
                className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="hidden w-full lg:flex lg:pl-10 max-lg:py-4">
              <ul className="flex lg:items-center flex-col gap-6 mt-4 lg:mt-0 lg:flex-row max-lg:mb-4">
                {["Home", "About us", "Products", "Features"].map((item) => (
                  <li key={item} className="px-1.5">
                    <a
                      href="#"
                      className="text-gray-500 text-base font-medium hover:text-lime-500 transition-all duration-500 lg:px-1.5 block lg:text-left"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="flex lg:items-center justify-start flex-col lg:flex-row gap-5 lg:flex-1 lg:justify-end">
                <button className="bg-lime-50 rounded-full text-center transition-all duration-500 py-2 px-3.5 hover:bg-lime-100">
                  <span className="px-1.5 text-sm font-medium leading-6 text-lime-600">Login</span>
                </button>
                <button className="bg-lime-600 rounded-full text-center shadow-[0px_1px_2px_0px_rgba(16,_24,_40,_0.05)] transition-all duration-500 py-2 px-3.5 hover:bg-lime-700">
                  <span className="px-1.5 text-white font-medium text-sm leading-6">Sign up </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <section className="w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="w-full justify-between items-center lg:gap-16 gap-8 flex lg:flex-row flex-col lg:pt-40 pt-10 pb-20">
            <div className="flex-col justify-start items-start lg:gap-5 gap-4 inline-flex">
              <h2 className="lg:max-w-xl w-full text-gray-900 text-4xl font-bold leading-normal lg:text-start text-center">
                {headline}
              </h2>
              <p className="lg:max-w-xl w-full text-gray-500 text-base leading-relaxed lg:text-start text-center">
                {subhead}
              </p>
            </div>
            <div className="flex-col justify-center items-center gap-2.5 flex relative">
              <div id="circle" className="w-[300px] h-[160px] flex items-center justify-center">
                <svg className="w-fit h-fit" xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
                  <defs>
                    <path id="circlePath" d=" M 150, 150 m -60, 0 a 60,60 0 0,1 120,0 a 60,60 0 0,1 -120,0 " />
                  </defs>
                  <circle cx="150" cy="100" r="75" fill="none" />
                  <g>
                    <use xlinkHref="#circlePath" fill="none" />
                    <text fill="#000">
                      <textPath xlinkHref="#circlePath">EXPLORE OUR COLLECTION-EXPLORE OUR COLLECTION</textPath>
                    </text>
                  </g>
                </svg>
              </div>
              <button className="w-[60px] h-[60px] absolute shadow-[0px_1px_2px_0px_rgba(16,_24,_40,_0.05)] bg-lime-500 rounded-full flex items-center justify-center group">
                <svg
                  className="group-hover:rotate-90 transition-all duration-700 ease-in-out"
                  xmlns="http://www.w3.org/2000/svg"
                  width="37"
                  height="38"
                  viewBox="0 0 37 38"
                  fill="none"
                >
                  <path
                    d="M16.2644 12.0329L25.5508 12.0329M25.5508 12.0329L25.5508 21.3193M25.5508 12.0329L11.7623 25.8214"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="relative w-full -translate-y-7">
          <img
            src={heroImage}
            alt="Pagedone sample"
            className="w-full 2xl:h-auto lg:h-full h-[504px] translate-y-0.5 relative -rotate-2 scale-x-105 object-cover"
          />
          <div className="marquee w-full p-3 absolute top-0 -rotate-2 bg-lime-400 backdrop-blur-[2px] justify-center items-center gap-2 inline-flex">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ul key={idx} className="animated-ul" aria-hidden={idx !== 0}>
                <li>
                  <div className="justify-start items-center gap-[9px] flex">
                    <div className="w-2 h-2 bg-gray-900 rounded-full" />
                    <h6 className="text-gray-900 text-base font-bold leading-relaxed whitespace-nowrap">
                      {marqueeText}
                    </h6>
                  </div>
                </li>
              </ul>
            ))}
          </div>
        </div>
      </section>
    </div>
  </>
);

const meta: Meta<typeof PageDoneSample> = {
  title: "POC/PageDoneSample",
  component: PageDoneSample,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    headline: "Elevate Your Style with Our Exclusive Collections",
    subhead: "Welcome to our lifestyle blog, your ultimate destination for embracing the richness of life. Dive into a world of inspiration.",
    marqueeText: "Elevate Your Style with Our Exclusive Collections",
    heroImage: "https://pagedone.io/asset/uploads/1720161813.png",
  },
};

export default meta;
type Story = StoryObj<typeof PageDoneSample>;

export const Default: Story = {};
