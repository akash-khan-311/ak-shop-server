/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import config from '../../config'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import httpStatus from 'http-status'
import { AuthService } from './auth.service'
import { JwtPayload } from 'jsonwebtoken'
import { createToken } from '../../utils/commonUtils'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false,
  path: "/",
};



export const oauthSuccessHandler = async (req: any, res: any) => {
  const oauthUser = req.user;
  const dbUser = await User.findOne({ email: oauthUser.email });
  if (!dbUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const isProd = process.env.NODE_ENV === "production";
  const cookieOpts = { httpOnly: true, secure: isProd, sameSite: "lax" };
  if (dbUser.status === "blocked") {
    res.clearCookie("accessToken", cookieOpts);
    res.clearCookie("refreshToken", cookieOpts);
    return res.redirect(
      `${config.client_side_url}/auth/callback?success=0&message=${encodeURIComponent(
        "You can't login using this gmail"
      )}`
    );
  }
  const jwtPayload = {
    _id: dbUser._id,
    name: dbUser.name,
    email: dbUser.email,
    userId: dbUser.id,
    role: dbUser.role,
    createdAt: dbUser.createdAt,
  };

  const accessToken = createToken(jwtPayload, config.jwt_access_token_secret!, config.jwt_access_token_expires_in!);
  const refreshToken = createToken(jwtPayload, config.jwt_refresh_token_secret!, config.jwt_refresh_token_expires_in!);


  res.cookie("accessToken", accessToken, cookieOpts);

  res.cookie("refreshToken", refreshToken, cookieOpts);


  //  frontend redirect
  return res.redirect(`${config.client_side_url}/auth/callback?success=1`);
};
export const loginUser = catchAsync(async (req, res) => {
  const result = await AuthService.loginUserIntoDb(req.body)
  const { refreshToken, accessToken } = result
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production' ? true : false,
    httpOnly: true
  })
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: { accessToken }
  })
})
export const logout = catchAsync(async (req, res) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies
  // console.log('refresh token from auth controller', refreshToken)
  const result = await AuthService.refreshToken(refreshToken)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Refresh token Fetched successfully',
    data: result
  })
})

const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body
  const result = await AuthService.changePasswordIntoDB(
    req.user as JwtPayload,
    passwordData
  )
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password changes successfully',
    data: result
  })
})

const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body
  await AuthService.forgetPasswordIntoDB(email)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password Reset Link Sent Successfully',
    data: null
  })
})



export const AuthController = {
  loginUser,
  refreshToken,
  forgetPassword,
  changePassword,
  logout
}
