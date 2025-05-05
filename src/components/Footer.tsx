import {
	Footer,
	SiteInfo,
	FooterSection,
	FooterLogo,
} from "@govtechmy/myds-react/footer";
import { GithubIcon } from "@govtechmy/myds-react/icon";
import { Link } from "@govtechmy/myds-react/link";

export default function FooterBar() {
	return (
		<Footer className="top-0 z-10 max-h-[170px] overflow-hidden">
			<FooterSection className="flex justify-between w-full">
				<SiteInfo>
					<div className="flex justify-between items-center gap-4">
						<div className="text-txt-black-900 flex flex-col gap-4">
							<FooterLogo
								logoTitle={
									<p className="font-poppins text-body-md whitespace-nowrap font-semibold">
										DataRyder
									</p>
								}
								logo={
									<img
										src="https://avatars.githubusercontent.com/u/205435790?s=200&v=4"
										width={36}
										alt="logo"
										className="select-none"
									/>
								}
							/>
							<Link
								href="https://github.com/dataryder"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Github link"
								underline="none"
								className="hover:text-txt-black-900"
							>
								<GithubIcon className="text-txt-black-700" />
							</Link>
						</div>
					</div>
				</SiteInfo>
				<div className="flex flex-col items-end text-txt-black-500 text-xs px-4 mt-auto">
					<p>All Rights Reserved © {new Date().getFullYear()} DataRyder</p>
					<p>Last updated: 5th May 2025</p>
				</div>

			</FooterSection>
		</Footer>

	);
};	