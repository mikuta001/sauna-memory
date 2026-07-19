"use client";
import { House, Album, SquarePlus, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/home", label: "ホーム", icon: House },
  { href: "/album", label: "アルバム", icon: Album },
  { href: "/records/sauna", label: "記録", icon: SquarePlus },
  { href: "/mypage", label: "マイページ", icon: UserRound },
];

const NavigationBar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-14 w-full items-center justify-around border-t border-[color:var(--black)] bg-[color:var(--white)] md:bottom-auto md:top-0 md:h-screen md:w-56 md:flex-col md:items-stretch md:justify-start md:border-r md:border-t-0 md:px-3 md:py-6">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
            className={
              isActive
                ? "flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--black)] text-[color:var(--white)] md:w-full md:justify-start md:gap-3 md:rounded-md md:px-3"
                : "flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--black)] md:w-full md:justify-start md:gap-3 md:rounded-md md:px-3"
            }
          >
            <Icon size={24} />
            <span className="hidden text-sm md:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default NavigationBar;
