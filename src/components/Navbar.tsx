import { useNavigate } from "react-router-dom";
import {
	Navbar,
	NavbarAction,
	NavbarMenu,
} from "@govtechmy/myds-react/navbar";
import { ThemeSwitch } from "../components/ThemeSwitch";
import { Button } from "@govtechmy/myds-react/button";

export default function NavBarHeader() {
	const navigate = useNavigate();
	return (
		<Navbar className="h-16">
			<div className="flex h-full w-auto items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
				<img src="/icon.png"
					alt="Money Logo"
					width={40}
					height={32}
					className="aspect-auto h-full max-h-8 w-auto select-none"
				/>
				<span className="font-semibold max-w-[200px] font-heading text-txt-black-900 text-body-lg">
					OpenPriceCatcher
				</span>
			</div>
			<NavbarMenu>
				<Button onClick={() => navigate("/")} variant={"default-ghost"} className="w-full my-1 xl:w-auto xl:my-0 focus:ring-otl-success-200/40">Home</Button>
				<Button onClick={() => navigate("/category")} variant={"default-ghost"} className="w-full my-1 xl:w-auto xl:my-0 focus:ring-otl-success-200/40">Category</Button>
			</NavbarMenu>
			<NavbarAction className="xl:hidden focus:ring-otl-success-200/40">
				<ThemeSwitch as="toggle" />
			</NavbarAction>
		</Navbar>
	);
};	