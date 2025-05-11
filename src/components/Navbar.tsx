import { useNavigate } from "react-router-dom";
import {
	Navbar,
	NavbarAction,
	NavbarMenu,
} from "@govtechmy/myds-react/navbar";
import { ThemeSwitch } from "@govtechmy/myds-react/theme-switch";
import { Button } from "@govtechmy/myds-react/button";

export default function NavBarHeader() {
	const navigate = useNavigate();
	return (
		<Navbar className="max-sm:flex h-[64px] px- md:px-4 w-full border items-center">
			<div className="flex h-full w-auto items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
				<img src="/icon.png"
					alt="Money Logo"
					width={40}
					height={32}
					className="aspect-auto h-full max-h-8 w-auto select-none"
				/>
				<span className="font-semibold max-w-[200px] font-heading text-txt-black-900 text-body-lg">
					Price Tracking
				</span>
			</div>
			<NavbarMenu>
				<Button onClick={() => navigate("/")} variant={"default-ghost"} className="max-sm:w-full max-sm:my-1">Home</Button>
				<Button onClick={() => navigate("/category")} variant={"default-ghost"} className="max-sm:w-full max-sm:my-1">Category</Button>
			</NavbarMenu>
			<NavbarAction className="md:hidden">
				<ThemeSwitch as="toggle" />
			</NavbarAction>
		</Navbar>
	);
};	