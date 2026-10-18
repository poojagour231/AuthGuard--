import React from 'react';

interface AuthGuardLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const AuthGuardLogo: React.FC<AuthGuardLogoProps> = ({ size = 'md' }) => {
  const dimensions =
    size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-8 h-8';

  return (
    <div
      className={`${dimensions} rounded-lg bg-[#00288e] text-white flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2.5L4.5 5.75V11.25C4.5 16.35 7.68 21.08 12 22.5C16.32 21.08 19.5 16.35 19.5 11.25V5.75L12 2.5Z"
          fill="#1e40af"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.25 12.25L11.1 14.1L15 9.75"
          stroke="#85f8c4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
