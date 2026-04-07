// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CertificateRegistry
 * @notice A decentralized system for issuing and verifying academic certificates.
 *         Maps student addresses to their certificates and provides public verification.
 */
contract CertificateRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Certificate {
        string ipfsCID;
        string studentName;
        string degree;
        string issueDate;
        string issuerName;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from student address to their certificates (for the Student Portal)
    mapping(address => Certificate[]) private studentCertificates;

    // Mapping from CID to certificate (for the Verifier Page)
    mapping(string => Certificate) private certificatesByCID;

    // Mapping from CID to student address (to prevent duplicates across different students)
    mapping(string => address) private cidToStudent;

    event CertificateIssued(
        address indexed student,
        string ipfsCID,
        string studentName,
        string degree,
        address indexed issuer
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    /**
     * @notice Issue a new certificate to a student.
     * @param _student The wallet address of the student.
     * @param _ipfsCID The IPFS Content Identifier of the certificate PDF.
     * @param _studentName The legal name of the student.
     * @param _degree The name of the degree or qualification.
     * @param _issueDate The date of issuance.
     * @param _issuerName The name of the issuing institution.
     */
    function issueCertificate(
        address _student,
        string memory _ipfsCID,
        string memory _studentName,
        string memory _degree,
        string memory _issueDate,
        string memory _issuerName
    ) external onlyRole(ISSUER_ROLE) {
        require(_student != address(0), "Invalid student address");
        require(bytes(_ipfsCID).length > 0, "Empty CID");
        require(!certificatesByCID[_ipfsCID].exists, "Certificate CID already registered");

        Certificate memory newCert = Certificate({
            ipfsCID: _ipfsCID,
            studentName: _studentName,
            degree: _degree,
            issueDate: _issueDate,
            issuerName: _issuerName,
            timestamp: block.timestamp,
            exists: true
        });

        studentCertificates[_student].push(newCert);
        certificatesByCID[_ipfsCID] = newCert;
        cidToStudent[_ipfsCID] = _student;

        emit CertificateIssued(_student, _ipfsCID, _studentName, _degree, msg.sender);
    }

    /**
     * @notice Fetch all certificates issued to a specific student address.
     * @param _student The wallet address of the student.
     * @return An array of Certificate structs.
     */
    function getCertificates(address _student) external view returns (Certificate[] memory) {
        return studentCertificates[_student];
    }

    /**
     * @notice Verify a certificate's authenticity using its IPFS CID.
     * @param _ipfsCID The IPFS Content Identifier to check.
     * @return The Certificate details if found.
     */
    function verifyCertificate(string calldata _ipfsCID) external view returns (Certificate memory) {
        require(certificatesByCID[_ipfsCID].exists, "Certificate not found on blockchain");
        return certificatesByCID[_ipfsCID];
    }

    /**
     * @notice Check if a certificate is valid and return the owner.
     * @param _ipfsCID The IPFS Content Identifier.
     * @return exists Whether the certificate exists.
     * @return student The address of the student it was issued to.
     */
    function checkValidity(string calldata _ipfsCID) external view returns (bool exists, address student) {
        return (certificatesByCID[_ipfsCID].exists, cidToStudent[_ipfsCID]);
    }
}
