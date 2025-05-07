import {
  Footer,
  SiteInfo,
  FooterSection,
  FooterLogo,
} from "@govtechmy/myds-react/footer";
import { Link } from "@govtechmy/myds-react/link";

export default function FooterBar() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return (
    <Footer className="top-0 z-10 overflow-hidden py-4 md:py-6 gap-1">
      <FooterSection className="flex justify-between w-full py-0 md:py-0 border-none">
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
            <p className="max-sm:hidden inline">Last updated: </p>
            {d.toLocaleDateString("en-MY")}
          </div>
        </div>
      </FooterSection>
      <FooterSection className="flex justify-center py-0 md:py-0 border-none">
        <p className="mt-1 text-[10px] text-txt-black-500 text-center">
          Data collected by{" "}
          <Link
            href="https://pricecatcher.kpdn.gov.my/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="KPDN link"
            underline="none"
            className="hover:text-txt-black-900 underline"
          >
            KPDN
          </Link>{" "}
          published by{" "}
          <Link
            href="https://data.gov.my/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="datagovmy link"
            underline="none"
            className="hover:text-txt-black-900 underline"
          >
            data.gov.my
          </Link>
        </p>
      </FooterSection>
    </Footer>
  );
}
