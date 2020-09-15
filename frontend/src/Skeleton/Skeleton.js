import React, { useEffect } from "react";
import Layout from "antd/es/layout";
import axios from "../config/axios";
import { Route, Switch, Redirect } from "react-router-dom";
import {
  OrganizationProvider,
  OrganizationConsumer,
  useOrganizationContext,
} from "../Context/OrganizationContext";
import OrganizationSelectOrCreate from "../OrganizationSelectOrCreate/OrganizationSelectOrCreate";
import AppRouter from "../Routes/AppRouter";
import Invitation from "../Routes/Invitation/Invitation";
import Footer from "../Components/Footer";

const Skeleton = () => {
  
  return (
    <Layout style={{ height: "auto", minHeight: "100vh" }}>
      <Switch>
        <Route path="/app/invitation/:id">
          <Invitation />
        </Route>
        <Route path={"/app/register"}>
          <Redirect to={"/app"} />
        </Route>

        <Route path={"/app/:organization_id"}>
          <AppRouter />
        </Route>
        <Route path={"/app"}>
          <OrganizationSelectOrCreate />
        </Route>
        <Route path={"/*"}>
          <Redirect to={"/app"} />
        </Route>
      </Switch>

      <Footer />
    </Layout>
  );
};

export default Skeleton;
