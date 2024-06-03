import React from "react";
import Logo from "./Logo";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <div className="w-[60vw] min-w-96 py-4 rounded text-white flex flex-col items-center">
      <div className="w-20 my-4">
        <Logo />
      </div>

      <div className="w-full flex flex-col items-center gap-1">
        <h1 className="text-2xl font-semibold">Sign In</h1>
        <p className="text-zinc-500">
          Don't have an account?{" "}
          <Link to="/" title="Sign Up" className="text-white hover:underline">
            Sign Up
          </Link>
        </p>
      </div>

      <form className="my-8 space-y-4 w-[311.2px]">
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
        <div className="w-full flex justify-center">
          <button className="bg-white w-full text-zinc-950 py-2 rounded font-semibold mt-5 hover:bg-zinc-200 duration-200">
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignInForm;
