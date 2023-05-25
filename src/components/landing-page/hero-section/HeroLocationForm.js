import React, { useEffect, useState } from "react";
import {
  alpha,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CustomStackFullWidth } from "../../../styled-components/CustomStyles.style";
import { StyledButton } from "./HeroSection.style";
import { useGeolocated } from "react-geolocated";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import useGetAutocompletePlace from "../../../api-manage/hooks/react-query/google-api/usePlaceAutoComplete";
import useGetGeoCode from "../../../api-manage/hooks/react-query/google-api/useGetGeoCode";
import useGetZoneId from "../../../api-manage/hooks/react-query/google-api/useGetZone";
import useGetPlaceDetails from "../../../api-manage/hooks/react-query/google-api/useGetPlaceDetails";
import AllowLocationDialog from "../../Map/AllowLocationDialog";
import CustomMapSearch from "../../Map/CustomMapSearch";
import MapModal from "../../Map/MapModal";
import { ModuleSelection } from "./module-selection";
import { useDispatch, useSelector } from "react-redux";
import { module_select_success } from "../../../utils/toasterMessages";
import { setWishList } from "../../../redux/slices/wishList";
import { useWishListGet } from "../../../api-manage/hooks/react-query/wish-list/useWishListGet";
import { getToken } from "../../../helper-functions/getToken";

const HeroLocationForm = () => {
  const theme = useTheme();
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState(undefined);
  const [geoLocationEnable, setGeoLocationEnable] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(undefined);
  const [showCurrentLocation, setShowCurrentLocation] = useState(false);
  const [zoneIdEnabled, setZoneIdEnabled] = useState(false);
  const [placeId, setPlaceId] = useState("");
  const [placeDescription, setPlaceDescription] = useState(undefined);
  const [placeDetailsEnabled, setPlaceDetailsEnabled] = useState(false);
  const [openModuleSelection, setOpenModuleSelection] = useState(false);
  const dispatch = useDispatch();
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => setOpen(true);

  // const dispatch = useDispatch();

  //****getting current location/***/
  const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
      isGeolocationEnabled: true,
    });

  const handleCloseLocation = () => {
    setOpenLocation(false);
    setShowCurrentLocation(false);
    setGeoLocationEnable(false);
    setCurrentLocation(undefined);
  };
  const handleAgreeLocation = () => {
    if (coords) {
      setLocation({ lat: coords?.latitude, lng: coords?.longitude });
      setOpenLocation(false);
      setShowCurrentLocation(true);
      setGeoLocationEnable(true);
      setZoneIdEnabled(true);
    } else {
      setOpenLocation(true);
    }
  };
  //*****getting current location end****//

  //***place autocomplate***///
  const HandleChangeForSearch = (event) => {
    setSearchKey(event.target.value);
    if (event.target.value) {
      setEnabled(true);
      setGeoLocationEnable(true);
      setCurrentLocation(event.target.value);
    } else {
      setEnabled(false);
      setCurrentLocation(undefined);
    }
  };
  const handleChange = (event, value) => {
    if (value) {
      setPlaceId(value?.place_id);
      setPlaceDescription(value?.description);
      setZoneIdEnabled(false);
      setGeoLocationEnable(true);
    }
    setPlaceDetailsEnabled(true);
  };
  const { data: places, isLoading } = useGetAutocompletePlace(
    searchKey,
    enabled
  );

  useEffect(() => {
    if (places) {
      setPredictions(places?.predictions);
    }
  }, [places]);

  const { data: geoCodeResults } = useGetGeoCode(location, geoLocationEnable);

  useEffect(() => {
    if (geoCodeResults?.results && showCurrentLocation) {
      setCurrentLocation(geoCodeResults?.results[0]?.formatted_address);
    }
  }, [geoCodeResults, location]);

  const { data: zoneData } = useGetZoneId(location, zoneIdEnabled);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (zoneData) {
        // dispatch(setZoneData(zoneData?.data?.zone_data));
        localStorage.setItem("zoneid", zoneData?.zone_id);
      }
    }
  }, [zoneData]);
  //
  // //********************Pick Location */
  const { isLoading: isLoading2, data: placeDetails } = useGetPlaceDetails(
    placeId,
    placeDetailsEnabled
  );
  //
  useEffect(() => {
    if (placeDetails) {
      setLocation(placeDetails?.result?.geometry?.location);
    }
  }, [placeDetails]);

  // const orangeColor = theme.palette.primary.main;

  useEffect(() => {
    if (placeDescription) {
      setCurrentLocation(placeDescription);
    }
  }, [placeDescription]);

  // get module from localstorage
  let selectedModule = undefined;
  if (typeof window !== "undefined") {
    selectedModule = localStorage.getItem("module");
  }
  const onSuccessHandler = (response) => {
    dispatch(setWishList(response));
  };
  const { refetch: wishlistRefetch, isLoading: isLoadingWishlist } =
    useWishListGet(onSuccessHandler);
  const setLocationEnable = async () => {
    if (!currentLocation) {
      toast.error(t("Location is required."), {
        id: "id",
      });
    }
    setGeoLocationEnable(true);
    setZoneIdEnabled(true);

    if (currentLocation && location) {
      if (getToken()) {
        wishlistRefetch();
      }
      localStorage.setItem("location", currentLocation);
      localStorage.setItem("currentLatLng", JSON.stringify(location));
      //handleModalClose();

      toast.success(t("New location has been set."));
      setOpenModuleSelection(true);
      // if (!selectedModule) {
      //   setOpenModuleSelection(true);
      // } else {
      //   router.push("/home");
      // }
    } else {
      toast.error(t("Location is required."), {
        id: "id",
      });
    }
  };
  const handleCloseModuleModal = (item) => {
    if (item) {
      toast.success(t(module_select_success));
      router.push("/home", undefined, { shallow: true });
    }
    setOpenModuleSelection(false);
  };

  return (
    <>
      <Stack
        width="100%"
        backgroundColor={alpha(theme.palette.primary.main, 0.2)}
        padding={{ xs: "1rem", md: "1.5rem" }}
        borderRadius={isXSmall ? "0px" : "14px"}
        // marginBottom={isXSmall && "35px"}
      >
        <CustomStackFullWidth
          direction={{
            sm: "colum",
            md: "row",
          }}
          spacing={{ xs: 1, md: 2 }}
          alignItems="center"
        >
          <CustomStackFullWidth
            direction="row"
            alignItems="center"
            justifyContent="center"
          >
            <CustomMapSearch
              showCurrentLocation={showCurrentLocation}
              predictions={predictions}
              handleChange={handleChange}
              HandleChangeForSearch={HandleChangeForSearch}
              handleAgreeLocation={handleAgreeLocation}
              currentLocation={currentLocation}
              handleCloseLocation={handleCloseLocation}
              frommap="false"
              fromparcel="false"
            />
            <StyledButton
              fullwidth="false"
              // language_direction={language_direction}
              radiuschange="true"
              onClick={() => setLocationEnable()}
            >
              {t("Set Location")}
            </StyledButton>
          </CustomStackFullWidth>
          <Typography>{t("Or")}</Typography>
          <StyledButton onClick={handleOpen}>{t("Pick Form Map")}</StyledButton>
        </CustomStackFullWidth>
        {open && (
          <MapModal
            open={open}
            handleClose={handleClose}
            coords={coords}
            disableAutoFocus
          />
        )}
        {openLocation && (
          <AllowLocationDialog
            handleCloseLocation={handleCloseLocation}
            openLocation={openLocation}
            isGeolocationEnabled={isGeolocationEnabled}
          />
        )}
      </Stack>
      {openModuleSelection && (
        <ModuleSelection
          location={currentLocation}
          closeModal={handleCloseModuleModal}
          setOpenModuleSelection={setOpenModuleSelection}
          disableAutoFocus
        />
      )}
    </>
  );
};
export default HeroLocationForm;
