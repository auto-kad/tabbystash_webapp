import Header from "../components/Header";
import Link from "next/link";
import axios from "axios";
import { Router, useRouter } from "next/router";
import { useState } from "react";
import GoogleLogin from "react-google-login";

axios.defaults.withCredentials = true;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const loginUser = async (event) => {
    event.preventDefault();

    const paramsForFormData = new URLSearchParams();
    paramsForFormData.append("email", email);
    paramsForFormData.append("password", password);

    await axios
      .post(process.env.API_BASE_URL + "/auth/passLogin", paramsForFormData)
      .then((res) => {
        console.log("the result from logging in: ", res);
        if (res.data.success) {
          console.log("success recieved");
          router.push("/dashboard");
        }
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const initiateOAuthGoogle = async () => {
    console.log("initiation started");
    await axios
      .get(process.env.API_BASE_URL + "/authentication/dummy")
      .then((response) => {
        console.log("testing");
        console.log(response);
        window.location = response.data.url;
      })
      .catch((err) => {
        console.log("err");
        console.log(err);
      });
  };

  const responseGoogle = async (response) => {
    console.log("the response in general", response);
    await axios
      .get(process.env.API_BASE_URL + "/auth/testGoogleCallback", {
        headers: {
          Authorization: `${response.code}`,
        },
      })
      .then((responseAuth) => {
        console.log("testing success response", responseAuth);
      })
      .catch((errAuth) => {
        console.log("testing error", errAuth);
      });
  };

  return (
    <>
      <div className="min-h-screen flex flex-col justify-start py-12 px-6">
        <h1 className="text-white text-center text-3xl font-extrabold">
          Sign In
        </h1>
        <h2 className="text-sm text-white font-extrabold text-center py-3">
          Don't have an account?
          <Link href="/signUpPage">
            <a className="text-peach">
              <strong> Sign up</strong>
            </a>
          </Link>
        </h2>
        <div className="px-6">
          <form
            onSubmit={loginUser}
            className="space-y-6"
            action={process.env.API_BASE_URL + "/auth/passLogin"}
            method="POST"
          >
            <div className="flex flex-col justify-center items-center">
              {/*the email address input for the form*/}
              <label
                for="email"
                className="w-full sm:max-w-5xl block text-sm font-medium text-white"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                required
                className="py-3 px-4 mt-2 w-full sm:max-w-5xl border-2 border-white bg-gray-700 text-white rounded-md focus:outline-none focus:border-peach"
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              <label
                for="password"
                className="w-full sm:max-w-5xl block text-sm font-medium text-white"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                required
                className="py-3 px-4 mt-2 w-full sm:max-w-5xl border-2 border-white bg-gray-700 text-white rounded-md focus:outline-none focus:border-peach"
              />
            </div>
            <div className="w-full flex flex-col justify-center items-center">
              <button
                className="mt-4 w-full sm:max-w-lg px-2 py-3 bg-gray-600 rounded-xl"
                type="submit"
              >
                <span className="text-white font-semibold text-xl">Login</span>
              </button>
            </div>
          </form>
        </div>
        {/* <div className="px-5 py-4">
          <GoogleLogin
            clientId=""
            onSuccess={responseGoogle}
            responseType="code"
          />
        </div> */}
      </div>
    </>
  );
}

LoginPage.getLayout = function getLayout(page) {
  return (
    <>
      <Header isLoginPageOrLoggedIn={true} isFAQPage={false} />
      {page}
    </>
  );
};
