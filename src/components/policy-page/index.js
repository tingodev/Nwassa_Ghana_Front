import React from "react";
import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import H1 from "../typographies/H1";
import { CustomStackFullWidth } from "../../styled-components/CustomStyles.style";
import { Skeleton } from "@mui/material";
export const PolicyShimmer = () => (
  <CustomStackFullWidth>
    <Skeleton variant="text" width="100%" height="20px" />
    <Skeleton variant="text" width="70%" height="20px" />
    <Skeleton variant="text" width="50%" height="20px" />
  </CustomStackFullWidth>
);
const PolicyPage = (props) => {
  const { title, data, isFetching } = props;

  return (
    <Box minHeight="80vh">
      <Grid container item md={12} xs={12} spacing={3}>
        <Grid item md={12} xs={12} alignItems="center" justifyContent="center">
          <H1 text={title} />
        </Grid>
        <Grid item md={12} xs={12} sx={{ paddingBottom: "50px" }}>
          <Box>
            {isFetching ? (
              <PolicyShimmer />
            ) : (
              data && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: data?.value
                  }}
                ></div>
              )
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PolicyPage;
