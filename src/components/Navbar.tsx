import {
	Navbar,
	NavbarLogo,
} from "@govtechmy/myds-react/navbar";
import { ThemeSwitch } from "@govtechmy/myds-react/theme-switch";

export default function NavBarHeader() {
	return (
		<Navbar className="px-0 md:px-4 w-full border">
			<NavbarLogo
				src="/icon.png"
				alt="Money Logo"
			>
				Price Tracking
			</NavbarLogo>
			<ThemeSwitch as="toggle" />
		</Navbar>
	);
};	