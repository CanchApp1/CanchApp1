package com.canchapp.CanchAPP_Back.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
public class Audit {
  private String user;
  private String ip;
  private String screen;
}
