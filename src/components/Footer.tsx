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
    <Footer className="top-0 z-10 overflow-hidden py-4 md:py-6 lg:py-6 ">
      <FooterSection className="flex justify-between w-full py-0 border-none">
        <SiteInfo>
          <div className="flex justify-between items-center gap-4">
            <div className="text-txt-black-900 flex flex-col gap-4">
              <Link
                href="https://github.com/dataryder"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Github link"
                underline="none"
                className="hover:text-txt-black-900"
              >
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
              </Link>
            </div>
          </div>
        </SiteInfo>
        <div className="flex flex-col items-end w-40 md:w-full text-end text-txt-black-500 text-xs px-4 mt-auto">
          <div>
            All Rights Reserved © {new Date().getFullYear()}{" "}
            <p className="max-sm:hidden inline">DataRyder</p>
          </div>
          <div>
            <p className="max-sm:hidden inline">Last updated: </p>5th May 2025
          </div>
        </div>
      </FooterSection>
    </Footer>
  );
}
