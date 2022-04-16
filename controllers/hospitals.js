const { start } = require('repl');
const Hospital = require('../models/Hospital');
const vacCenter = require('../models/VacCenter')

//@desc    Get all hospitals
//@route   GET /api/v1/hospitals
//@access  Public
exports.getHospitals= async (req,res,next)=>{
    let query;

    //Copy req.query
    const reqQuery= {...req.query};

    //Fields to exclude
    const removeFields=['select','sort','page','limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr=JSON.stringify(reqQuery);
    // let queryStr=JSON.stringify(req.query);
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);
    query=Hospital.find(JSON.parse(queryStr)).populate('appointments');

    //Select Fields
    if(req.query.select) {
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }

    //Sort
    if(req.query.sort) {
        const sortBy=req.query.sort.split(',').join(' ');
        query=query.sort(sortBy);
    } else {
        query=query.sort('-createdAt');
    }

    //Pagination
    const page=parseInt(req.query.page,10)||1;
    const limit=parseInt(req.query.limit,10)||25;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;

    try {
        const total=await Hospital.countDocuments();
        query=query.skip(startIndex).limit(limit);

        //Execute query
        const hospitals = await query
        // const hospitals = await Hospital.find(req.query);
        // console.log(req.query);

        //Pagination result
        const Pagination={};
        if(endIndex<total){
            Pagination.next={page:page+1,limit}
        }
        if(startIndex>0){
            Pagination.prev={page:page-1,limit}
        }

        res.status(200).json({success:true, count:hospitals.length, data:hospitals});
    } catch(err) {
        res.status(400).json({success:false});
    }
};

//@desc    Get single hospital
//@route   GET /api/v1/hospitals/:id
//@access  Public
exports.getHospital= async (req,res,next)=>{
    try {
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true, data:hospital});
    } catch(err) {
        res.status(400).json({success:false});
    }
};

//@desc    Create new hospitals
//@route   POST /api/v1/hospitals
//@access  Private
exports.createHospital= async (req,res,next)=>{
    const hospital = await Hospital.create(req.body);
    //console.log(req.body);
    res.status(201).json({
        success:true,
        data:hospital
    });
};

//@desc    Update hospital
//@route   PUT /api/v1/hospitals/:id
//@access  Private
exports.updateHospital= async(req,res,next)=>{
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators:true
        });

        if(!hospital){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true, data:hospital});
    } catch(err) {
        res.status(400).json({success:false});
    }
};

//@desc    Delete hospital
//@route   DELETE /api/v1/hospitals/:id
//@access  Private
exports.deleteHospital= async (req,res,next)=>{
    try {
        // const hospital = await Hospital.findByIdAndDelete(req.params.id);
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital){
            return res.status(400).json({success:false});
        }
        hospital.remove();
        res.status(200).json({success:true, data:{}});
    } catch(err) {
        res.status(400).json({success:false});
    }
};

//@desc    Get vaccine centers
//@route   GET /api/v1/hospitals/vacCenters/
//@access  Public
// exports.getVacCenters = (req,res,next) => {
//     vacCenter.getall((err, data) => {
//         if (err)
//             res.status(500).send({
//                 message: err.message || "Some error occurred while retrieving Vaccine Centers."
//             });
//         else res.send(data);
//     });
// };