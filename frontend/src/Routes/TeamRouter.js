import React, { useEffect, useContext } from "react";
import { Switch, Route, Redirect, useParams } from "react-router-dom";
import TeamHome from "../Components/Ui/TeamHome";
import AddMember from "../Pages/AddMember";
import Employees from "../Pages/Employees";
import Roles from "../Pages/Roles";
import { OrganizationContext } from "../Context/OrganizationContext";
import {
  UserAddOutlined,
  PartitionOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import HomeMenu from "../Components/Ui/HomeMenu";

const routeKeys = [
  {
    key: "/view",
    icon: <TeamOutlined />,
    title: "Employees",
  },
  {
    key: "/addMember",
    icon: <UserAddOutlined />,
    title: "Add Members",
  },
  {
    key: "/roles",
    icon: <PartitionOutlined />,
    title: "Roles",
  },
];

const TeamRouter = () => {
  const TeamId = useParams().teamId;
  const orgContext = useContext(OrganizationContext);
  useEffect(() => {
    document.title = "Team Members";
  }, []);
  return (
    <>
      {/* <TeamHome /> */}
      <HomeMenu param={"/team"} keys={routeKeys} />
      <Switch>
        <Route exact path="/app/:teamId/team">
          <Redirect to={`/app/${TeamId}/team`} />
        </Route>
        <Route exact path="/app/:teamId/team/view">
          <Employees />
        </Route>
        <Route path="/app/:teamId/team/addMember">
          <AddMember />
        </Route>
        <Route path="/app/:teamId/team/roles">
          <Roles />
        </Route>
      </Switch>
    </>
  );
};

export default TeamRouter;
