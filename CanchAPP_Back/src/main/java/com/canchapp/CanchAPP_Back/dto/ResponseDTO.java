package com.canchapp.CanchAPP_Back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDTO {
  private String status;
  private String message;
  private int code;
  private int count;
  private Object data;
}
