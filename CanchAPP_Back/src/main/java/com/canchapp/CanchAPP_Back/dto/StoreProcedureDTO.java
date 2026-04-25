package com.canchapp.CanchAPP_Back.dto;

public class StoreProcedureDTO {

  public String nameStoreProcedure;
  public String schema;


  public StoreProcedureDTO(String nameStoreProcedure, String schema) {
    this.nameStoreProcedure = nameStoreProcedure;
    this.schema = schema;
  }

  public String getNameStoreProcedure() {
    return nameStoreProcedure;
  }

  public void setNameStoreProcedure(String nameStoreProcedure) {
    this.nameStoreProcedure = nameStoreProcedure;
  }

  public String getSchema() {
    return schema;
  }

  public void setSchema(String schema) {
    this.schema = schema;
  }
}
