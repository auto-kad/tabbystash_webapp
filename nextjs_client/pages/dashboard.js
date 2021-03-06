import axios from "axios";
import Header from "../components/Header";
import { useRouter } from "next/router";
import FailedToGetTabData from "../components/FailedToGetTabData";
import DisplayTabData from "../components/DisplayTabData";
import { useState } from "react";

axios.defaults.withCredentials = true;

export default function Dashboard(props) {
  function dashboardOutput() {
    if (props.callForTabDataFailed) {
      // the callForTabData key is only attached to the props object when calling the Flask API for a users tab data failed; it's never attached in any other situation, so there's no need to check the value. If it even exists on the props object, then we know that the call to the Flask API failed.
      return <FailedToGetTabData />;
    }
    return <DisplayTabData tabData={props.tabData} />;
  }
  return <>{dashboardOutput()}</>;
}

export async function getServerSideProps({ req }) {
  console.log("the request headers: ", req.headers);
  var loggedIn = false;

  await axios
    .get(process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/isLoggedIn", {
      headers: {
        Cookie: req.headers.cookie,
      },
    })
    .then((res) => {
      if (res.data.success) {
        loggedIn = true;
        // success message returned by the backend API means that the user is logged in and can now
        // if the user IS logged in, make a request for their data to be shown in the /dashboard page
        // if the user IS NOT LOGGED IN, redirect them to the login page
      }
    })
    .catch((err) => {});

  if (loggedIn) {
    var callForTabDataSucceeded = false;
    var tabDataFromServer = null;
    tabDataFromServer = await axios
      .get(process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/getUserTabData", {
        headers: {
          Cookie: req.headers.cookie,
        },
      })
      .then((res) => {
        if (res.data.success) {
          callForTabDataSucceeded = true;
          return res.data.success;
        }
      })
      .catch((err) => {
        console.log(err);
      });
    if (callForTabDataSucceeded) {
      // we want to know if calling the Flask API for getting tab data worked, because we need to tell the difference between: (1) no tab data showing because calling our Flask API failed (2) no tab data showing because the user has no tab data on record. If making the call for the tab data was successful but the user has no data, an empty object will be returned to the <DisplayTabData/> component, which will render an empty dashboard. If making the call for tab data wasn't successful, then an error messaage will be displayed in the dashboard page
      return {
        props: {
          tabData: tabDataFromServer,
        },
      };
    }
    return {
      props: {
        // if calling the Flask API for the user data failed, the result of callForTabDataSucceeded will be false. The value of callForTabDataFailed is the negated value of that, so it will be true. This is done for easier understanding when reading the value into the props object in the dashboard component.
        callForTabDataFailed: !callForTabDataSucceeded,
      },
    };
  }
  return {
    // if the user wasn't authenticated by the backend API, then redirect them to the login page
    redirect: {
      permanent: false,
      destination: "/loginPage",
    },
  };
}

Dashboard.getLayout = function getLayout(page) {
  return (
    <>
      <Header isLoginPageOrLoggedIn={true} isFAQPage={false} />
      {page}
    </>
  );
};
