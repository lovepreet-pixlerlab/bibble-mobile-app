// services/modules/authApi.js
import { METHODS } from '../../methods';
import { baseApi } from '../api';
import { apiEndPointes } from '../apiEndpoints';

export const authApi = baseApi.injectEndpoints({
  endpoints: build => ({
    login: METHODS.POST(build, apiEndPointes.login),
    register: METHODS.POST(build, apiEndPointes.register),
    verifyEmail: METHODS.POST(build, apiEndPointes.verifyEmail),
    requestVerifyEmail: METHODS.POST(build, apiEndPointes.requestVerifyEmail),
    forgotPassword: METHODS.POST(build, apiEndPointes.forgotPassword),
    resetPasswordOtpVerify: METHODS.POST(build, apiEndPointes.resetPasswordOtpVerify),
    changePassword: METHODS.POST(build, apiEndPointes.changePassword),
    resetPassword: METHODS.POST(build, apiEndPointes.resetPassword),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation, useVerifyEmailMutation, useRequestVerifyEmailMutation, useForgotPasswordMutation, useResetPasswordOtpVerifyMutation, useChangePasswordMutation, useResetPasswordMutation } = authApi;
