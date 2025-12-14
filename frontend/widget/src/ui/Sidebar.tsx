import React from "react";
import { MenuItem, User } from "../types";

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
  user: User;
}

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M12.5 14.0902L7.5 14.0902M2.5 9.09545V14.0902C2.5 15.6976 2.5 16.5013 2.98816 17.0006C3.47631 17.5 4.26198 17.5 5.83333 17.5H14.1667C15.738 17.5 16.5237 17.5 17.0118 17.0006C17.5 16.5013 17.5 15.6976 17.5 14.0902V10.9203C17.5 9.1337 17.5 8.24039 17.1056 7.48651C16.7112 6.73262 15.9846 6.2371 14.5313 5.24606L11.849 3.41681C10.9528 2.8056 10.5046 2.5 10 2.5C9.49537 2.5 9.04725 2.80561 8.151 3.41681L3.98433 6.25832C3.25772 6.75384 2.89442 7.0016 2.69721 7.37854C2.5 7.75548 2.5 8.20214 2.5 9.09545Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        ></path>
      </svg>
    ),
  },
  {
    name: "Employees",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M16.6667 17.5V16.7857C16.6667 15.9004 16.6667 15.4578 16.5831 15.0916C16.2982 13.8433 15.3234 12.8685 14.0751 12.5836C13.7089 12.5 13.2663 12.5 12.381 12.5H8.33333C6.7802 12.5 6.00363 12.5 5.39106 12.7537C4.5743 13.092 3.92538 13.741 3.58707 14.5577C3.33333 15.1703 3.33333 15.9469 3.33333 17.5M13.3333 5.83333C13.3333 7.67428 11.8409 9.16667 10 9.16667C8.15905 9.16667 6.66667 7.67428 6.66667 5.83333C6.66667 3.99238 8.15905 2.5 10 2.5C11.8409 2.5 13.3333 3.99238 13.3333 5.83333Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        ></path>
      </svg>
    ),
  },
  {
    name: "Attendances",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M13.892 7.83239L10.3009 11.4235C9.74538 11.979 9.4676 12.2568 9.12242 12.2568C8.77724 12.2568 8.49947 11.979 7.94391 11.4235L6.66667 10.1462M9.16667 17.5H10.8333C13.976 17.5 15.5474 17.5 16.5237 16.5237C17.5 15.5474 17.5 13.976 17.5 10.8333V9.16667C17.5 6.02397 17.5 4.45262 16.5237 3.47631C15.5474 2.5 13.976 2.5 10.8333 2.5H9.16667C6.02397 2.5 4.45262 2.5 3.47631 3.47631C2.5 4.45262 2.5 6.02397 2.5 9.16667V10.8333C2.5 13.976 2.5 15.5474 3.47631 16.5237C4.45262 17.5 6.02397 17.5 9.16667 17.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        ></path>
      </svg>
    ),
  },
  {
    name: "Calendar",
    href: "#",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 8.50002C3 6.6144 3 5.67159 3.58579 5.08581C4.17157 4.50002 5.11438 4.50002 6.99999 4.50002L17 4.5C18.8856 4.5 19.8284 4.5 20.4142 5.08578C21 5.67157 21 6.61438 21 8.5V17C21 18.8856 21 19.8285 20.4142 20.4142C19.8284 21 18.8856 21 17 21H7C5.11438 21 4.17157 21 3.58579 20.4142C3 19.8285 3 18.8856 3 17V8.50002Z"
          stroke="currentColor"
          strokeWidth="1.6"
          className="my-path"
        ></path>
        <path d="M3 10H21" stroke="currentColor" strokeWidth="1.6" className="my-path"></path>
        <path d="M8.05 14L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="my-path"></path>
        <path d="M8.05 17L8 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="my-path"></path>
        <path d="M12.05 14L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="my-path"></path>
        <path d="M12.05 17L12 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="my-path"></path>
        <path d="M16.05 14L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="my-path"></path>
        <path d="M16.05 17L16 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="my-path"></path>
        <path d="M8 3V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="my-path"></path>
        <path d="M16 3L16 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="my-path"></path>
      </svg>
    ),
  },
  {
    name: "Leaves",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M9.16667 17.5L5.83333 17.5V17.5C3.98765 17.5 2.5 16.0123 2.5 14.1667V14.1667L2.5 5.83333V5.83333C2.5 3.98765 3.98765 2.5 5.83333 2.5V2.5L9.16667 2.5M8.22814 10L17.117 10M14.3393 6.66667L17.0833 9.41074C17.3611 9.68852 17.5 9.82741 17.5 10C17.5 10.1726 17.3611 10.3115 17.0833 10.5893L14.3393 13.3333"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
    ),
  },
  {
    name: "Payroll",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M16.6667 8.33333C16.6667 9.71405 13.6819 10.8333 10 10.8333C6.3181 10.8333 3.33333 9.71405 3.33333 8.33333M16.6667 11.6667C16.6667 13.0474 13.6819 14.1667 10 14.1667C6.3181 14.1667 3.33333 13.0474 3.33333 11.6667M16.6667 15C16.6667 16.3807 13.6819 17.5 10 17.5C6.3181 17.5 3.33333 16.3807 3.33333 15M16.6667 5C16.6667 6.38071 13.6819 7.5 10 7.5C6.3181 7.5 3.33333 6.38071 3.33333 5C3.33333 3.61929 6.3181 2.5 10 2.5C13.6819 2.5 16.6667 3.61929 16.6667 5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        ></path>
      </svg>
    ),
  },
  {
    name: "Documents",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M2.5 14.1667V7.41356C2.5 5.14053 2.5 4.00401 3.18489 3.28088C3.21601 3.24802 3.24802 3.21601 3.28088 3.18489C4.00401 2.5 5.14053 2.5 7.41356 2.5H7.66435C8.25983 2.5 8.55757 2.5 8.8246 2.59333C8.98766 2.65033 9.14088 2.73232 9.27876 2.83639C9.50454 3.0068 9.66969 3.25453 10 3.75C10.3303 4.24547 10.4955 4.4932 10.7212 4.66361C10.8591 4.76768 11.0123 4.84967 11.1754 4.90667C11.4424 5 11.7402 5 12.3356 5H14.1667C15.738 5 16.5237 5 17.0118 5.48816C17.5 5.97631 17.5 6.76198 17.5 8.33333V8.75M8.13547 17.5H12.9046C14.1282 17.5 14.74 17.5 15.1879 17.1582C15.6357 16.8164 15.7971 16.2263 16.1199 15.046L16.3478 14.2127C16.8769 12.2782 17.1414 11.311 16.6412 10.6555C16.1409 10 15.1381 10 13.1326 10H8.36695C7.14807 10 6.53863 10 6.0916 10.3398C5.64456 10.6796 5.48145 11.2668 5.15523 12.4412L4.92374 13.2745C4.385 15.214 4.11562 16.1838 4.61585 16.8419C5.11608 17.5 6.12255 17.5 8.13547 17.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        ></path>
      </svg>
    ),
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isExpanded, toggleSidebar, user }) => {
  return (
    <aside
      id="sidemenu"
      className={`group min-h-screen max-sm:w-full flex flex-col flex-shrink-0 lg:group-[.is-open]:w-64 w-64 lg:group-[.is-open]:translate-x-0 group-[.is-open]:-translate-x-full lg:translate-x-0 fixed z-10 lg:w-16 transition-all duration-500 ease-in-out bg-white dark:bg-gray-900 lg:rounded-2xl border-r border-gray-200`}
    >
      <div className="flex items-center justify-between flex-shrink-0 group-[.is-open]:flex-row gap-4 mx-4 px-0 py-6 border-b border-gray-200 dark:border-gray-800">
        <a href="#" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            P
          </div>
          <div className="hidden group-[.is-open]:lg:block text-lg font-semibold text-gray-900">
            Pagedone
          </div>
        </a>
        <button
          id="navbar-toggle"
          onClick={toggleSidebar}
          className="absolute -right-3 group-[.is-open]:-right-2 w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700"
        >
          <svg
            className="transition-all duration-500 ease-in-out group-[.is-open]:rotate-0 rotate-180"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M10.0002 11.9999L6 7.99971L10.0025 3.99719"
              stroke="#111827"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-hidden overflow-y-auto pt-6 mx-3 group-[.is-open]:mx-3">
        <h5 className="py-2 pl-1 text-xs font-medium text-gray-400 uppercase">Menu</h5>
        <ul className="overflow-hidden flex flex-col gap-1.5">
          {menuItems.map((item, index) => (
            <li key={item.name}>
              <a
                href={item.href}
                className={`flex items-center gap-3 text-sm font-medium py-2 px-2 group-[.is-open]:px-2 group-[.is-open]:justify-start rounded-lg transition-all duration-500 whitespace-nowrap ${
                  index === 0
                    ? "text-gray-900 dark:text-white dark:bg-gray-700 bg-gray-50 stroke-indigo-600 dark:stroke-white justify-start"
                    : "text-gray-500 dark:text-gray-400 justify-start hover:bg-gray-50 active:bg-gray-50 hover:text-gray-900 hover:stroke-indigo-600 stroke-gray-500 dark:stroke-gray-400"
                }`}
              >
                <span>{item.icon}</span>
                <span className="lg:opacity-0 group-[.is-open]:opacity-100 transition-all duration-500 ease-in-out">
                  {item.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-shrink-0 mx-3 group-[.is-open]:mx-3">
        <h5 className="py-1.5 pl-1 text-xs font-medium text-gray-400 dark:text-gray-400 uppercase">
          User
        </h5>
        <ul className="overflow-hidden flex flex-col gap-2 pb-6">
          <li>
            <a
              href="#"
              className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm font-medium py-2 px-2 group-[.is-open]:px-2 group-[.is-open]:justify-start rounded-lg group transition-all duration-300 hover:text-gray-900 dark:stroke-gray-400 hover:bg-gray-50 hover:stroke-indigo-600 stroke-gray-500 whitespace-nowrap"
            >
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M2.5 5.41667C2.5 3.80584 3.80584 2.5 5.41667 2.5C7.0275 2.5 8.33333 3.80584 8.33333 5.41667C8.33333 7.0275 7.0275 8.33333 5.41667 8.33333C3.80584 8.33333 2.5 7.0275 2.5 5.41667Z"
                    strokeWidth="1.6"
                    stroke="currentColor"
                  ></path>
                  <path
                    d="M11.6667 5.41667C11.6667 4.24628 11.6667 3.66109 11.9476 3.24072C12.0691 3.05873 12.2254 2.90248 12.4074 2.78088C12.8278 2.5 13.4129 2.5 14.5833 2.5C15.7537 2.5 16.3389 2.5 16.7593 2.78088C16.9413 2.90248 17.0975 3.05873 17.2191 3.24072C17.5 3.66109 17.5 4.24628 17.5 5.41667C17.5 6.58705 17.5 7.17224 17.2191 7.59262C17.0975 7.7746 16.9413 7.93085 16.7593 8.05245C16.3389 8.33333 15.7537 8.33333 14.5833 8.33333C13.4129 8.33333 12.8278 8.33333 12.4074 8.05245C12.2254 7.93085 12.0691 7.7746 11.9476 7.59262C11.6667 7.17224 11.6667 6.58705 11.6667 5.41667Z"
                    strokeWidth="1.6"
                    stroke="currentColor"
                  ></path>
                  <path
                    d="M11.6667 14.5833C11.6667 12.9725 12.9725 11.6667 14.5833 11.6667C16.1942 11.6667 17.5 12.9725 17.5 14.5833C17.5 16.1942 16.1942 17.5 14.5833 17.5C12.9725 17.5 11.6667 16.1942 11.6667 14.5833Z"
                    strokeWidth="1.6"
                    stroke="currentColor"
                  ></path>
                  <path
                    d="M2.5 14.5833C2.5 13.4129 2.5 12.8278 2.78088 12.4074C2.90248 12.2254 3.05873 12.0691 3.24072 11.9476C3.66109 11.6667 4.24628 11.6667 5.41667 11.6667C6.58705 11.6667 7.17224 11.6667 7.59262 11.9476C7.7746 12.0691 7.93085 12.2254 8.05245 12.4074C8.33333 12.8278 8.33333 13.4129 8.33333 14.5833C8.33333 15.7537 8.33333 16.3389 8.05245 16.7593C7.93085 16.9413 7.7746 17.0975 7.59262 17.2191C7.17224 17.5 6.58705 17.5 5.41667 17.5C4.24628 17.5 3.66109 17.5 3.24072 17.2191C3.05873 17.0975 2.90248 16.9413 2.78088 16.7593C2.5 16.3389 2.5 15.7537 2.5 14.5833Z"
                    strokeWidth="1.6"
                    stroke="currentColor"
                  ></path>
                </svg>
              </span>
              <span className="lg:opacity-0 group-[.is-open]:opacity-100 transition-all duration-500 ease-in-out">
                Apps &amp; Integration
              </span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="group flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm font-medium py-2 px-2 group-[.is-open]:px-2 group-[.is-open]:justify-start rounded-lg transition-all duration-500 hover:bg-gray-50 active:bg-gray-50 hover:text-gray-900 hover:stroke-indigo-600 stroke-gray-500 dark:stroke-gray-400 whitespace-nowrap"
            >
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M16.75 9.20285C17.4657 8.79486 17.7119 7.89657 17.3011 7.19137L16.5589 5.91699C16.1384 5.19489 15.1995 4.94638 14.466 5.36301C13.4468 5.94185 12.1715 5.19438 12.1715 4.03885C12.1715 3.19732 11.4763 2.5 10.6188 2.5H9.17626C8.33943 2.5 7.66105 3.16571 7.66105 3.9869V4.09222C7.66105 5.19157 6.44707 5.8776 5.47814 5.3258C4.78218 4.92946 3.89051 5.16345 3.48905 5.84779L2.70097 7.19113C2.28757 7.89582 2.53264 8.79589 3.24913 9.20432C4.24548 9.77228 4.24331 11.1862 3.24898 11.7576C2.53335 12.1688 2.28709 13.0712 2.70084 13.7764L3.48905 15.12C3.89051 15.8043 4.78472 16.0369 5.48068 15.6406C6.44654 15.0905 7.66105 15.7719 7.66105 16.8677C7.66105 17.6529 8.3097 18.2895 9.10985 18.2895H10.6852C11.5061 18.2895 12.1715 17.6365 12.1715 16.831C12.1715 15.7075 13.4115 15.0058 14.4023 15.5686L14.466 15.6048C15.1995 16.0214 16.1384 15.7729 16.5589 15.0508L17.3013 13.7762C17.7123 13.0704 17.465 12.1699 16.7502 11.7591C15.7547 11.1871 15.7525 9.77146 16.75 9.20285Z"
                    strokeWidth="1.6"
                    stroke="currentColor"
                  ></path>
                  <path
                    d="M12.6799 10.3947C12.6799 11.8481 11.4793 13.0263 9.99828 13.0263C8.51724 13.0263 7.31662 11.8481 7.31662 10.3947C7.31662 8.94136 8.51724 7.76316 9.99828 7.76316C11.4793 7.76316 12.6799 8.94136 12.6799 10.3947Z"
                    strokeWidth="1.6"
                    stroke="currentColor"
                  ></path>
                </svg>
              </span>
              <span className="lg:opacity-0 group-[.is-open]:opacity-100 transition-all duration-500 ease-in-out">
                Settings
              </span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="group flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm font-medium py-2 px-2 group-[.is-open]:px-2 group-[.is-open]:justify-start rounded-lg transition-all duration-500 hover:bg-gray-50 active:bg-gray-50 hover:text-gray-900 hover:stroke-indigo-600 stroke-gray-500 dark:stroke-gray-400 whitespace-nowrap"
            >
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 15.8333C10 15.8333 10 15.8333 10 15.8333ZM10 15.8333C10.4602 15.8333 10.8333 16.2064 10.8333 16.6667M10 15.8333C9.53976 15.8333 9.16667 16.2064 9.16667 16.6667M10.8333 16.6667C10.8333 16.6667 10.8333 16.6667 10.8333 16.6667ZM10.8333 16.6667C10.8333 17.1269 10.4602 17.5 10 17.5M10.8333 16.6667H11.6667C13.5076 16.6667 15 15.1743 15 13.3333M9.16667 16.6667C9.16667 16.6667 9.16667 16.6667 9.16667 16.6667ZM9.16667 16.6667C9.16667 17.1269 9.53976 17.5 10 17.5M10 17.5C10 17.5 10 17.5 10 17.5ZM15 8.33333V7.5C15 4.73858 12.7614 2.5 10 2.5C7.23858 2.5 5 4.73858 5 7.5V8.33333M4.58333 13.3333C3.43274 13.3333 2.5 12.4006 2.5 11.25V10.4167C2.5 9.26607 3.43274 8.33333 4.58333 8.33333C5.73393 8.33333 6.66667 9.26607 6.66667 10.4167V11.25C6.66667 12.4006 5.73393 13.3333 4.58333 13.3333ZM15.4167 8.33333C16.5673 8.33333 17.5 9.26607 17.5 10.4167V11.25C17.5 12.4006 16.5673 13.3333 15.4167 13.3333C14.2661 13.3333 13.3333 12.4006 13.3333 11.25V10.4167C13.3333 9.26607 14.2661 8.33333 15.4167 8.33333Z"
                    strokeWidth="1.6"
                    stroke="currentColor"
                  ></path>
                </svg>
              </span>
              <span className="lg:opacity-0 group-[.is-open]:opacity-100 transition-all duration-500 ease-in-out">
                Documents
              </span>
            </a>
          </li>
        </ul>

        <div className="py-5 flex justify-between items-center border-t border-solid border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 overflow-hidden">
              <img src={user.avatar} alt="user avatar" className="w-full h-full object-cover" />
            </div>
            <div className="opacity-0 group-[.is-open]:opacity-100 transition-all duration-500 ease-in-out">
              <p className="font-semibold text-xs text-gray-900 dark:text-white mb-0.5 whitespace-nowrap">
                {user.name}
              </p>
              <p className="font-medium text-xs text-gray-500 dark:text-gray-400">{user.handle}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
