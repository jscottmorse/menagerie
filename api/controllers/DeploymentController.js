'use strict';

/**
 * DeploymentController
 *
 * @description :: Server-side logic for managing Deployments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var helper = require('../../lib/relationshipUtils');
var BaseController = require('../../lib/BaseController')('Deployment');
var debug = require('debug')('controller:Deployment');
var extend = require('gextend');

var Controller = {
    checkIn: function(req, res){
        var locationId = req.body.location,
            deploymentId = req.body.deployment,
            deviceId = req.body.device;

        var promises = [
            Location.findOne({uuid: locationId}),
            DeployedDevice.findOne({uuid:deviceId}).populateAll()
        ];

        Promise.all(promises).then(function(results){

            var device = results[1];
            var location = results[0];

            if(!device) return res.ok({ok: false});
            if(!device.deployment) return res.ok({ok: false});
            if(device.deployment.uuid !== deploymentId) return res.ok({ok: false});

            device.state = 'checkin';
            device.location = location.id;
            device.save(function(){

                res.ok({ok:true, device: device});
            });


        }).catch(function(err){
            res.sendError(err);
        });
    },
    provision: function(req, res){
        if(!req.options.hasOwnProperty('limit')
            && !req.wantsJSON) req.options.limit = (sails.config.blueprints.clietRecordLimit || 10);

        var Resource = BaseController.Resource;

        var Model = Resource.getModel();

        var id = Model.getPk(req);

        var criteria = getCriteria(req);
        console.log('criteria', criteria);
        /*
         * We are picking up the deployment id
         * from the url, and messes up the criteria
         */
        delete criteria.id;

        var query = Device.find()
            .where(criteria)
            .limit(Resource.actionUtil.parseLimit(req))
            .skip(Resource.actionUtil.parseSkip(req))
            .sort(Resource.actionUtil.parseSort(req));

        query.populateAll();

        query.exec(function found(err, records){
            if(err) return res.negotiate(err);

            Model.findOne(id).then(function(deployment){
                return res.ok({
                    form: {
                        action: '/' + Resource.nicename,
                        method: 'POST',
                        intent: 'create'
                    },
                    record: deployment,
                    records: records,
                    criteria: criteria,
                    nicename: 'provision',
                    title: 'Details'
                }, Resource.getViewPath('provision'));
            }).catch(function(err){
                res.negotiate(err);
            });
        });
    },
    addDevices: function(req, res){
        var id = req.param('id'),
            ids = req.param('ids');

        console.log('id', id, 'ids', ids);

        //get current deployment
        console.log('get current deployment', id);
        Deployment.findOne(id).then(function(deployment){
            //get all devices.
            Device.find(ids).then(function(records){
                //manually filter those that have an undesired state
                var newRecords = [];
                records.map(function(r){
                    if(r.status !== 'inuse') newRecords.push(r);
                });
                //Create a DeployedDevice with status provisioned
                return DeployedDevice.createFromDevice(newRecords, deployment.id).then(function(deployed){
                    //Update Device status to reserved
                    return Device.update(ids, {status:'reserved'}).then(function(updated){
                        res.ok({ok: true, records: updated, deployed: deployed});
                    });
                });
            });
        }).catch(function(err){
            res.negotiate(err);
        });
    },
};

module.exports = extend({}, BaseController, Controller);


function getCriteria(req){
    /*
     * We can only pull in devices that are in specific
     * { or:[
         {status: {'like': 'inuse'}},
         {status: {'like': 'not_inuse'}}
         ]
     }
     */
    var def = {where: {status: 'available'}};
    var criteria = BaseController.Resource.actionUtil.parseCriteria(req);
    console.log('req criteria', criteria);
    criteria = extend(def, criteria);
    return criteria;
}
