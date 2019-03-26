'use strict';
var async = require('async'),
  _ = require('lodash'),
  errorHandler = require('../errors.server.controller'),
  mongoose = require('mongoose'),
  Roles = mongoose.model('Roles'),
  Features = mongoose.model('Features'),
  User = mongoose.model('User');

// Configure view model for UAC dashboard
exports.getUACViewModel = function (req, res) {
  async.waterfall([
      //retrieve all roles
      function (cb) {
        Roles.find().sort({
            _id: -1
          })
          .lean()
          .exec((err, roles) => {
            if (err) {
              cb(err);
            }

            cb(null, roles);
          });
      },
      function (roles, cb) {
        // retrieve each roles assigned features based on permissions
        async.each(roles, (role, done) => {
          if (role.featurePermissions.length) {
            Features.find({
                permissions: {
                  $in: _.map(role.featurePermissions)
                }
              })
              .lean()
              .exec((err, features) => {
                if (err) {
                  return done(err);
                }
                role.features = _.forEach(features, (feature) => {
                  return _.remove(feature.permissions, (permission) => {
                    const _id = permission._id.toString();
                    return !_.includes(role.featurePermissions, _id)
                  });
                })
                delete role.featurePermissions;
                done(null);
              });
          } else {
            delete role.featurePermissions;
            role.features = [];
            done(null);
          }
        }, (err) => {
          if (err) {
            return cb(err);
          }

          cb(null, roles);
        });
      },
      function (roles, cb) {
        // For each role, retrieve every assigned user
        async.each(roles, (role, done) => {
          User.aggregate([{
              $match: {
                roles: {
                  $all: [role._id.toString()]
                }
              }
            }, {
              $project: {
                name: '$username',
                displayName: 1,
                email: 1
              }
            }])
            .exec((err, users) => {
              if (err) {
                return done(err);
              }

              role.users = users ? users : [];
              done(null);
            });
        }, (err) => {
          if (err) {
            return cb(err);
          }

          cb(null, roles);
        });
      },
      function (roles, cb) {
        Features.find()
          .lean()
          .exec((err, features) => {
            if (err) {
              cb(err);
            }

            cb(null, roles, features);
          });
      },
      function (roles, features, cb) {
        User.aggregate([{
          $project: {
            name: "$username",
            displayName: 1,
            email: 1
          }
        }]).exec(function (err, users) {
          if (err) {
            cb(err);
          }

          cb(null, {
            roles: roles,
            features: features,
            users: users
          })
        })
      }
    ],
    function (err, result) {
      if (err) {
        return res.status(500).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      res.status(200).send(result);
    });
};

exports.getMenuConfiguration = function (callback) {
  Features.find()
    .lean()
    .exec(function (err, features) {
      if (err) {
        return res.status(500).send({
          error: 'Unable to retrieve menu configuration'
        });
      }

      async.each(features, (feature, done) => {
        if (feature.permissions.length) {
          Roles.find({
              permissions: {
                $in: _.map(feature.permissions, (permission) => {
                  return permission.perm_id
                })
              }
            }).select('name')
            .exec((err, roles) => {
              if (err) {
                return done(err);
              }

              feature.roles = _.map(roles, (role) => {
                return role.name;
              });
              delete feature.permissions;
              done(null);
            })
        } else {
          done(null);
        }
      }, (err) => {
        if (err) {
          return callback(err);
        }

        callback(null, features);
      });
    });
};