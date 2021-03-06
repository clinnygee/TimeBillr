const db = require("../../database/models/index");
const mailer = require("../../mailer/config");
const mailOptions = require("../../mailer/mailOptions");

const { ErrorHandler } = require("../Middleware/ErrorHandler");
// const { sequelize } = require("../../database/models/index");

const TeamRolesController = {
  async create(req, res) {
    console.log("in the team roles create route");
    console.log(req.body);
    console.log(db.TeamRoles);
    console.log(req.body.casualRate === 16.5);
    let { TeamId, title, casualRate, partTimeRate, fullTimeRate } = req.body;

    casualRate = parseFloat(casualRate);
    console.log(casualRate);
    console.log(casualRate === 16.5);

    try {
      let newRole = await db.TeamRoles.create({
        TeamId: TeamId,
        title: title,
        casualRate: parseFloat(casualRate),
        partTimeRate: parseFloat(partTimeRate),
        fullTimeRate: parseFloat(fullTimeRate),
      });

      newRole.title = title;
      newRole.casualRate = parseFloat(casualRate);
      newRole.partTimeRate = parseFloat(partTimeRate);
      newRole.fullTimeRate = parseFloat(fullTimeRate);
      newRole.save();

      console.log(newRole);
      res
        .status(200)
        .send({ success: `The role ${newRole.title} has been added` });
    } catch (error) {}
  },

  async delete(req, res, next) {
    console.log("----------------Delete Route----------------");
    const { TeamRoleId } = req.body;

    try {
      if (!(req.permissions === "owner" || req.permissions === "manager")) {
        throw new ErrorHandler(400, "Need to be an owner or manager");
      }

      let roleToDelete = await db.TeamRoles.findOne({
        where: { id: TeamRoleId },
      });

      // this needs to delete all of the things related to it.
      // perhaps not even delete the role, just give it a flag of 'retired role' = true orsomething,
      // So it can be undone
      // Looks into deleted paranoid
      const deleted = await roleToDelete.destroy();
      console.log(deleted);
      if (deleted) {
        console.log(deleted);
        res.status(200).send({ success: "Employee Role deleted" });
      }
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    console.log("---------------In Update---------------");
    let {
      TeamRoleId,
      TeamId,
      title,
      casualRate,
      partTimeRate,
      fullTimeRate,
    } = req.body;

    try {
      const t = await db.sequelize.transaction(async (t) => {
        const roleToUpdate = await db.TeamRoles.findOne({
          where: { id: TeamRoleId },
        });

        updatedRole = await roleToUpdate.update({
          title: title,
          casualRate: parseFloat(casualRate),
          partTimeRate: parseFloat(partTimeRate),
          fullTimeRate: parseFloat(fullTimeRate),
        });

        return updatedRole;
      });
      if (t) {
        res.status(200).send({ success: `Role ${title} has been updated.` });
      } else {
        throw new ErrorHandler(400, "Error updating Role");
      }
    } catch (error) {
      next(error);
    }
  },

  async addUser(req, res, next) {
    console.log("----------------_Add User -------------");
    console.log(req.body);
    const { name, roleTitle, teamId, TeamRoleId, TeamMembershipId } = req.body;
    console.log(req.permissions);
    try {
      if (!(req.permissions === "owner" || req.permissions === "manager")) {
        throw new ErrorHandler(400, "Need to be an owner or manager");
      }

      let newEmployeeRole = await db.EmployeeRole.create({
        TeamRoleId: TeamRoleId,
        TeamMembershipId: TeamMembershipId,
      });
      console.log("hello");

      if (newEmployeeRole) {
        res.status(200).send({ success: `${name} add to ${roleTitle}` });
      }
    } catch (error) {
      next(error);
    }
  },

  async removeUser(req, res, next) {
    const { TeamRoleId, TeamMembershipId } = req.body;
    try {
      if (!(req.permissions === "owner" || req.permissions === "manager")) {
        throw new ErrorHandler(400, "Need to be an owner or manager");
      }

      const employeeRoleToDelete = await db.EmployeeRole.findOne({
        where: { TeamRoleId: TeamRoleId, TeamMembershipId: TeamMembershipId },
      });
      if (employeeRoleToDelete) {
        employeeRoleToDelete.destroy();
        res.status(200).send({ success: "Employee Role removed" });
      } else {
        throw new ErrorHandler(400, "Employee role not found");
      }
    } catch (error) {
      next(error);
    }
  },
};

module.exports = TeamRolesController;
