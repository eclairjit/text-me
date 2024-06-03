import React from "react";
import Logo from "./Logo";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axios from "axios";

const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const signUp = async (data) => {
    try {
      const formData = new FormData();

      formData.append(data);

      let res = await axios.post("/api/v1/user/sign-up", formData);

      if (!res) {
        console.log("Some error occurred during sign up.");
      }

      res = axios.post("/api/v1/user/sign-in", {
        email: data.email,
        password: data.password,
      });

      if (!res) {
        console.log("Some error occurred during sign in.");
      }

      console.log("User registered successfully.");
    } catch (error) {
      console.log(`Error in registering user. Error: ${error.message}`);
    }
  };

  return (
    <div className="w-[60vw] min-w-96 py-4 rounded text-white flex flex-col items-center">
      <div className="w-20 my-4">
        <Logo />
      </div>

      <div className="w-full flex flex-col items-center gap-1">
        <h1 className="text-2xl font-semibold">Sign Up</h1>
        <p className="text-zinc-500">
          Already have an account?{" "}
          <Link
            to="/sign-in"
            title="Sign In"
            className="text-white hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(signUp)} className="my-8 space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Username"
            className="p-2 rounded placeholder:text-zinc-500 focus:outline-none text-white bg-transparent border border-zinc-500"
            {...register("username", { required: true })}
          />
          {errors.username && (
            <p className="text-red-700 mt-1 text-sm">Username is required.</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            className="p-2 rounded placeholder:text-zinc-500 focus:outline-none text-white bg-transparent border border-zinc-500"
            {...register("email", { required: true })}
          />
          {errors.email && (
            <p className="text-red-700 mt-1 text-sm">Email is required.</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            className="p-2 rounded placeholder:text-zinc-500 focus:outline-none text-white bg-transparent border border-zinc-500"
            {...register("password", { required: true })}
          />
          {errors.password && (
            <p className="text-red-700 mt-1 text-sm">Password is required.</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="avatar">Profile Picture</label>
          <input
            id="avatar"
            type="file"
            placeholder="Password"
            className="p-2 rounded placeholder:text-zinc-500 focus:outline-none text-white bg-transparent border border-zinc-500"
            {...register("avatar")}
          />
        </div>
        <div className="w-full flex justify-center">
          <button className="bg-white text-zinc-950 py-2 w-full rounded font-semibold mt-5 hover:bg-zinc-200 duration-200">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
