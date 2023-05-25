import React from "react";
import {
  StyledFooterBackground,
  StyledFooterTopContainer,
} from "./Footer.style";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import FooterBottom from "./FooterBottom";
import FooterTop from "./footer-top/FooterTop";
import FooterMiddle from "./footer-middle/FooterMiddle";
import { useRouter } from "next/router";
import CustomContainer from "../container";

const FooterComponent = (props) => {
  const { configData } = props;
  const router = useRouter();
  const isLandingPage = router.pathname === "/" ? "true" : "false";
  return (
    <StyledFooterBackground nobottommargin={isLandingPage}>
      <CustomStackFullWidth
        height="100%"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <CustomContainer>
          <CustomStackFullWidth spacing={3}>
            <FooterTop />
            <FooterMiddle configData={configData} />
          </CustomStackFullWidth>
        </CustomContainer>
        <FooterBottom configData={configData} />
      </CustomStackFullWidth>
    </StyledFooterBackground>
  );
};

export default FooterComponent;
