import {
	Navbar,
	NavbarLogo,
	// NavbarMenu,
	// NavbarMenuItem,
	// NavbarMenuDropdown,
	NavbarAction,
} from "@govtechmy/myds-react/navbar";
import { ThemeSwitch } from "@govtechmy/myds-react/theme-switch";

export default function NavBarHeader() {
	return (
		<Navbar className="px-4">
			<NavbarLogo
				src="https://d2391uizq0pg2.cloudfront.net/common/logo.svg"
				alt="Malaysian Government Design System"
			>
				Price Tracking
			</NavbarLogo>
			{/* <NavbarMenu>
				<NavbarMenuItem href="/menu1">Menu 1</NavbarMenuItem>
				<NavbarMenuItem href="/menu2">Menu 2</NavbarMenuItem>
				<NavbarMenuDropdown title="Menu Dropdown">
					<NavbarMenuItem href="/submenu1">Submenu 1</NavbarMenuItem>
					<NavbarMenuItem href="/submenu2">Submenu 2</NavbarMenuItem>
					<NavbarMenuItem href="/submenu3">Submenu 3</NavbarMenuItem>
					<NavbarMenuItem href="/submenu1">Submenu 4</NavbarMenuItem>
				</NavbarMenuDropdown>
				<NavbarMenuItem href="/menu3">Menu 3</NavbarMenuItem>
			</NavbarMenu> */}
			<ThemeSwitch as="toggle" />
		</Navbar>
	);
};	