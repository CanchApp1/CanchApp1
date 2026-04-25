package com.canchapp.CanchAPP_Back.dto;

import java.util.Map;

public class ApiRequest<T> {

  private StoreProcedureDTO storeProcedure;

  private Audit audit;

  private Map<String, Object> objectRequest;

  public ApiRequest() {
  }

  public ApiRequest(StoreProcedureDTO storeProcedure, Audit audit, Map<String, Object> objectRequest) {
    this.storeProcedure = storeProcedure;
    this.audit = audit;
    this.objectRequest = objectRequest;
  }

  public StoreProcedureDTO getStoreProcedure() {
    return storeProcedure;
  }

  public void setStoreProcedure(StoreProcedureDTO storeProcedure) {
    this.storeProcedure = storeProcedure;
  }

  public Audit getAudit() {
    return audit;
  }

  public void setAudit(Audit audit) {
    this.audit = audit;
  }

  public Map<String, Object> getObjectRequest() {
    return objectRequest;
  }

  public void setObjectRequest(Map<String, Object> objectRequest) {
    this.objectRequest = objectRequest;
  }
}
