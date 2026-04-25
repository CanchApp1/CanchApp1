package com.canchapp.CanchAPP_Back.dto;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class ResponseService {
  public <T> ApiResponse<T> createResponse(T objectResponse, String operation) {
    String message;
    HttpStatus status;

    switch (operation.toLowerCase()) {
      case "create":
        message = "Created successfully";
        status = HttpStatus.CREATED;
        break;
      case "update":
        message = "Updated successfully";
        status = HttpStatus.OK;
        break;
      case "delete":
        message = "Deleted successfully";
        status = HttpStatus.NO_CONTENT;
        break;
      case "retrieve":
        message = "Retrieved successfully";
        status = HttpStatus.OK;
        break;
      case "not_found":
        message = "record not found";
        status = HttpStatus.NO_CONTENT;
        break;

      case "procedure executed successfully":
        message = "Executed successfull";
        status = HttpStatus.OK;
        break;
      default:
        message = "Operation not recognized";
        status = HttpStatus.BAD_REQUEST;
        break;
    }

    return new ApiResponse<>(
      objectResponse,
      message,
      status.is2xxSuccessful(),
      status.value());
  }
}
