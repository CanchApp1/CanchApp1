package com.canchapp.CanchAPP_Back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ApiResponse<T> {
  private T objectResponse;
  private String message;
  private LocalDateTime timestamp;
  private boolean success;
  private int responseCode;

  public ApiResponse() {
    this.timestamp = LocalDateTime.now();
  }

  public ApiResponse(T objectResponse, String message, boolean success, int responseCode) {
    this.objectResponse = objectResponse;
    this.message = message;
    this.timestamp = LocalDateTime.now();
    this.success = success;
    this.responseCode = responseCode;
  }

  // Getters and Setters
  public T getObjectResponse() {
    return objectResponse;
  }

  public void setObjectResponse(T objectResponse) {
    this.objectResponse = objectResponse;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public LocalDateTime getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(LocalDateTime timestamp) {
    this.timestamp = timestamp;
  }

  public boolean isSuccess() {
    return success;
  }

  public void setSuccess(boolean success) {
    this.success = success;
  }

  public int getResponseCode() {
    return responseCode;
  }

  public void setResponseCode(int responseCode) {
    this.responseCode = responseCode;
  }
}
